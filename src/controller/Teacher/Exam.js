import mongoose, { Types } from "mongoose";
import Exam from "../../DB/exam.js";
import Submission from "../../DB/submission.js";

export const CreateExam = async (req, res) => {
  try {
      const exam = new Exam(req.body);
      await exam.save();
      res.status(201).json({ message: "Exam created successfully", exam });
    } catch (error) {
      res.status(500).json({ message: "Failed to create exam", error });
    }
  };

export const FetchExams = async (req, res) => {
  try {
    const { teacherName } = req.params;
    console.log("teacherName: ", teacherName);
    if (!teacherName) {
      return res.status(400).json({ message: "param not passed correctly" });
    }
    const exams = await Exam.find({ teacher: teacherName });
    console.log({ exams });
    return res.status(200).json({ message: "Fetched Exams", exams });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const FetchExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;
    console.log(examId);
    if (!examId) {
      return res.status(400).json({ message: "param not passed correctly" });
    }
    const examIdObject = new Types.ObjectId(`${examId}`);
    const examDetail =
      (await Exam.findById(examId)) || Exam.findById(examIdObject);
  } catch (error) {}
};


export const FetchExamSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ submittedAt: -1 });

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: "No submissions found." });
    }

    res.status(200).json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};