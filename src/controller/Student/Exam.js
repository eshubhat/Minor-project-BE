import mongoose from "mongoose";
import Exam from "../../DB/exam.js";
import StudentExamSubmission from "../../DB/SubmitExam.js";

// Fetch Exam Questions
export const FetchExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid or missing examId" });
    }

    const examDetail = await Exam.findById(examId);
    if (!examDetail) {
      return res.status(404).json({ message: "Exam not found" });
    }

    return res.status(200).json({ message: "Exam fetched successfully", examDetail });
  } catch (error) {
    console.error("FetchExamQuestions Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Submit Exam (Automated scoring)
export const SubmitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId, answers } = req.body;

    if (!studentId || !examId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = exam.questions;

    if (questions.length !== answers.length) {
      return res.status(400).json({ message: "Number of answers doesn't match number of questions" });
    }

    let correctCount = 0;
    const answerDetail = questions.map((question, index) => {
      const isCorrect = question.correctOption === answers[index];
      if (isCorrect) correctCount++;
      return {
        question: question.question,
        selectedOption: answers[index],
        correctOption: question.correctOption,
        isCorrect,
      };
    });

    const submission = new StudentExamSubmission({
      studentId,
      examId,
      answers: answerDetail,
      score: correctCount,
      totalQuestions: questions.length,
    });

    await submission.save();

    return res.status(201).json({
      message: "Exam submitted successfully",
      result: {
        score: correctCount,
        totalQuestions: questions.length,
      },
    });
  } catch (error) {
    console.error("SubmitExam Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Update Score Manually (User-friendly for examiners)
export const UpdateStudentScore = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { newScore } = req.body;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ message: "Invalid submission ID" });
    }

    if (typeof newScore !== "number" || newScore < 0) {
      return res.status(400).json({ message: "Invalid score" });
    }

    const submission = await StudentExamSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.score = newScore;
    await submission.save();

    return res.status(200).json({ message: "Score updated successfully", updatedSubmission: submission });
  } catch (error) {
    console.error("UpdateStudentScore Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};
