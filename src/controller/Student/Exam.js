import mongoose from "mongoose";
import Exam from "../../DB/exam.js";
import StudentExamSubmission from "../../DB/SubmitExam.js";

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

    return res.status(200).json({ message: "Exam Fetched", examDetail });
  } catch (error) {
    console.error("Error in FetchExamQuestions:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const SubmitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId, answers } = req.body;
    // const studentId = studentid;

    console.log(examId, studentId, typeof answers);

    if (!studentId || !examId || !Array.isArray(answers)) {
      console.log(studentId, examId, answers);
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Fetch the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = exam.questions;

    // Validate answer count
    if (questions.length !== answers.length) {
      return res.status(400).json({
        message: "Number of answers doesn't match number of questions",
      });
    }

    // Calculate score
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

    console.log(
      "studentId: ",
      studentId,
      "examId: ",
      examId,
      "answers: ",
      answerDetail,
      "score: ",
      correctCount,
      "totalQuestions: ",
      questions.length
    );

    // Save submission
    const submission = new StudentExamSubmission({
      studentId,
      examId,
      answers: answerDetail,
      score: correctCount,
      totalQuestions: questions.length,
    });

    await submission.save();

    console.log("submissions submitted");

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
