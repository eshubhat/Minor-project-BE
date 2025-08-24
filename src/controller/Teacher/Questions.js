import Question from "../../DB/Question.js";
import mongoose from "mongoose";

export const createQuestions = async (req, res) => {
  try {
    const { examType, questions } = req.body;
    console.log("examType:", examType);
    console.log("questions:", questions);

    const createdBy = req.user?.id || req.body.createdBy;

    if (!examType) {
      return res.status(400).json({
        success: false,
        message: "Exam type (droneType) is required",
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array is required and must not be empty",
      });
    }

    const validDroneTypes = ["micro", "small", "medium", "large"];
    if (!validDroneTypes.includes(examType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid drone type. Must be one of: ${validDroneTypes.join(
          ", "
        )}`,
      });
    }

    const preparedQuestions = [];
    const validationErrors = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionNumber = i + 1;

      try {
        if (
          !q.question ||
          typeof q.question !== "string" ||
          !q.question.trim()
        ) {
          validationErrors.push(
            `Question ${questionNumber}: Question text is required`
          );
          continue;
        }

        // Validate options
        if (!q.options || !Array.isArray(q.options)) {
          validationErrors.push(
            `Question ${questionNumber}: Options must be an array`
          );
          continue;
        }

        // Filter out empty options and validate
        const validOptions = q.options
          .filter((opt) => opt && typeof opt === "string" && opt.trim())
          .map((opt) => opt.trim());

        if (validOptions.length < 2) {
          validationErrors.push(
            `Question ${questionNumber}: Must have at least 2 non-empty options`
          );
          continue;
        }

        // Validate correct option index
        if (q.correctOption === undefined || q.correctOption === null) {
          validationErrors.push(
            `Question ${questionNumber}: Correct option index is required`
          );
          continue;
        }

        const correctOptionIndex = parseInt(q.correctOption);
        if (
          isNaN(correctOptionIndex) ||
          correctOptionIndex < 0 ||
          correctOptionIndex >= validOptions.length
        ) {
          validationErrors.push(
            `Question ${questionNumber}: Correct option index must be between 0 and ${
              validOptions.length - 1
            }`
          );
          continue;
        }

        // Validate difficulty
        const validDifficulties = ["easy", "medium", "hard"];
        const difficulty = q.difficulty || "medium";
        if (!validDifficulties.includes(difficulty)) {
          validationErrors.push(
            `Question ${questionNumber}: Invalid difficulty. Must be one of: ${validDifficulties.join(
              ", "
            )}`
          );
          continue;
        }

        // Validate and process tags
        let tags = [];
        if (q.tags) {
          if (Array.isArray(q.tags)) {
            tags = q.tags
              .filter((tag) => tag && typeof tag === "string" && tag.trim())
              .map((tag) => tag.trim());
          } else if (typeof q.tags === "string") {
            tags = q.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag);
          }
        }

        // Create question object
        const questionData = {
          question: q.question.trim(),
          options: validOptions,
          correctOption: correctOptionIndex,
          droneType: examType,
          difficulty: difficulty,
          tags: tags,
          isActive: q.isActive !== undefined ? Boolean(q.isActive) : true,
        };

        preparedQuestions.push(questionData);
      } catch (error) {
        validationErrors.push(`Question ${questionNumber}: ${error.message}`);
      }
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors found",
        errors: validationErrors,
        validQuestions: preparedQuestions.length,
        totalQuestions: questions.length,
      });
    }

    // Save questions to database WITHOUT transactions
    const savedQuestions = await Question.insertMany(preparedQuestions, {
      ordered: false, // Continue even if some fail
    });

    console.log("Questions saved successfully:", savedQuestions.length);

    // Return success response
    res.status(201).json({
      success: true,
      message: `${savedQuestions.length} questions created successfully for ${examType} drone type`,
      data: {
        questions: savedQuestions.map((q) => ({
          id: q._id,
          question: q.question,
          options: q.options,
          correctOption: q.correctOption,
          droneType: q.droneType,
          difficulty: q.difficulty,
          tags: q.tags,
          isActive: q.isActive,
          createdAt: q.createdAt,
        })),
        summary: {
          totalCreated: savedQuestions.length,
          droneType: examType,
          createdBy: createdBy,
        },
      },
    });
  } catch (error) {
    console.error("Error creating questions:", error);

    // Handle specific mongoose validation errors
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Database validation error",
        errors: errorMessages,
      });
    }

    // Handle bulk write errors
    if (
      error.name === "BulkWriteError" ||
      error.name === "MongoBulkWriteError"
    ) {
      // Check if any documents were actually inserted despite the error
      const insertedDocs = error.insertedDocs || [];
      const successCount = insertedDocs.length;

      if (successCount > 0) {
        console.log(
          `${successCount} questions were actually saved despite the error`
        );
        return res.status(201).json({
          success: true,
          message: `${successCount} questions created successfully for ${examType} drone type`,
          data: {
            questions: insertedDocs.map((q) => ({
              id: q._id,
              question: q.question,
              options: q.options,
              correctOption: q.correctOption,
              droneType: q.droneType,
              difficulty: q.difficulty,
              tags: q.tags,
              isActive: q.isActive,
              createdAt: q.createdAt,
            })),
            summary: {
              totalCreated: successCount,
              droneType: examType,
            },
          },
        });
      }

      const errorMessages = error.writeErrors?.map((err) => err.errmsg) || [];
      return res.status(400).json({
        success: false,
        message: `Failed to create questions`,
        errors: errorMessages,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate question found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while creating questions",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  } finally {
    console.log("Question creation process completed");
  }
};

/**
 * Get questions by drone type with filtering options
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getQuestionsByDroneType = async (req, res) => {
  try {
    const { droneType } = req.params;
    const {
      difficulty,
      limit = 50,
      page = 1,
      tags,
      isActive = true,
      // createdBy,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Validate drone type
    const validDroneTypes = ["micro", "small", "medium", "large"];
    if (!validDroneTypes.includes(droneType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid drone type. Must be one of: ${validDroneTypes.join(
          ", "
        )}`,
      });
    }

    // Build query
    const query = { droneType };

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    // if (createdBy) {
    //   query.createdBy = new mongoose.Types.ObjectId(createdBy);
    // }

    if (tags) {
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      if (tagArray.length > 0) {
        query.tags = { $in: tagArray };
      }
    }

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const questions = await Question.find(query)
      .select("-__v")
      .populate("createdBy", "name email")
      .sort(sortObject)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
          hasNext: skip + questions.length < total,
          hasPrev: parseInt(page) > 1,
        },
        filters: {
          droneType,
          difficulty,
          tags: tags ? tags.split(",") : undefined,
          isActive,
          // createdBy
        },
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching questions",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

/**
 * Update a question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updateData = req.body;
    const userId = req.user?.id;

    // Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check if user is the creator (optional authorization)
    // if (userId && question.createdBy.toString() !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'You can only update questions you created'
    //   });
    // }

    // Update the question
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    res.json({
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);

    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorMessages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating question",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

/**
 * Delete a question (soft delete by setting isActive to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user?.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check authorization
    if (userId && question.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete questions you created",
      });
    }

    // Soft delete
    await Question.findByIdAndUpdate(questionId, { isActive: false });

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting question",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};
