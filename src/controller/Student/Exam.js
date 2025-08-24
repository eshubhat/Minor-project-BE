import mongoose from "mongoose";
import QuestionSet from "../../DB/exam.js";
import Submission from "../../DB/submission.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { generateAndSendCertificate } from "../../utils/sendEmail.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export const FetchExamQuestions = async (req, res) => {
  try {
    const dataPath = path.join(__dirname, "/data.json");
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    const questionData = JSON.parse(fileContent);
    const { type } = req.params;

    if (!["micro", "small", "medium"].includes(type)) {
      return res.status(400).json({ error: "Invalid type specified" });
    }

    if (!questionData || !questionData.questions) {
      return res.status(404).json({ message: "No questions found." });
    }

    // Find the first (or latest) document
    const filteredQuestions = questionData.questions.filter(
      (q) => q.type.toLowerCase() === type
    );

    if (filteredQuestions.length === 0) {
      return res.status(404).json({ message: `No ${type} questions found.` });
    }
    // Shuffle questions
    const shuffledQuestions = shuffleArray(filteredQuestions);

    res.json({ questions: shuffledQuestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const SubmitExam = async (req, res) => {
  try {
    const { candidateName, candidateEmail, droneType, answers } = req.body;
    const dataPath = path.join(__dirname, "/data.json");
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    const questionData = JSON.parse(fileContent);

    if (
      !candidateName ||
      !candidateEmail ||
      !droneType ||
      !Array.isArray(answers)
    ) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // Build a map: question -> correctOption + type
    const questionMap = {};
    questionData.questions.forEach((q) => {
      questionMap[q.question] = {
        correctOption: q.correctOption, // assuming you store correctOption number
        options: q.options,
        type: q.type,
      };
    });

    let totalQuestions = answers.length;
    let correctAnswers = 0;
    let totalTimeTaken = 0;

    const processedAnswers = answers.map(({ question, answer, timeTaken }) => {
      const questionInfo = questionMap[question];

      if (!questionInfo) {
        throw new Error(`Question not found: ${question}`);
      }
      console.log(questionInfo);

      const isCorrect =
        answer === questionInfo.options[questionInfo.correctOption - 1];
      if (isCorrect) correctAnswers++;
      totalTimeTaken += timeTaken || 0;

      console.log("curr", questionInfo.options[questionInfo.correctOption - 1]);
      return {
        question: question,
        selectedOption: answer,
        correctOption: questionInfo.options[questionInfo.correctOption - 1],
        type: questionInfo.type,
        timeTaken: timeTaken || 0,
      };
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const newSubmission = new Submission({
      candidateName,
      candidateEmail,
      droneType,
      answers: processedAnswers,
      score,
      totalTimeTaken,
    });

    await newSubmission.save();

    if (score > 0) {
      generateAndSendCertificate({
        email: candidateEmail,
        name: candidateName,
        completionDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        course: `${droneType} exam`,
      });
    }

    return res.status(201).json({
      success: true,
      submissionId: newSubmission._id,
      score,
      totalTimeTaken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const FetchAnalysis = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$droneType",
          count: { $sum: 1 },
          avgScore: { $avg: "$score" },
          maxScore: { $max: "$score" },
          minScore: { $min: "$score" },
          passedCount: {
            $sum: {
              $cond: [{ $gte: ["$score", 3] }, 1, 0], // Passing if score >= 3
            },
          },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          passedCount: 1,
          failedCount: { $subtract: ["$count", "$passedCount"] },
          avgScore: { $round: ["$avgScore", 2] },
          maxScore: 1,
          minScore: 1,
          passRate: {
            $round: [
              {
                $multiply: [{ $divide: ["$passedCount", "$count"] }, 100],
              },
              2,
            ],
          },
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ];

    const result = await Submission.aggregate(pipeline);

    console.log("Drone type analytics result:", result);

    res.json(result);
  } catch (error) {
    console.error("Drone type analytics error:", error);
    res.status(500).json({ error: "Server error while analyzing data" });
  }
};
