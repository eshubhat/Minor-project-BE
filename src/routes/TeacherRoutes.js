import e from "express";
import {
  CreateExam,
  FetchExams,
  FetchExamDetails,
  FetchExamSubmissions,
} from "../controller/Teacher/Exam.js";
import {
  createQuestions,
  getQuestionsByDroneType,
  updateQuestion,
  deleteQuestion,
} from "../controller/Teacher/Questions.js"

const router = e.Router();

router.post("/createExam", CreateExam);
router.get("/fetchExams/:teacherName", FetchExams);
router.get("/fetchExamDetails/:examId", FetchExamDetails);
router.get("/fetchExamSubmissions", FetchExamSubmissions);
// Create questions
router.post("/createQuestion", createQuestions);

// Get questions by drone type
router.get("/:droneType", getQuestionsByDroneType);

// Update question
router.put("/:questionId", updateQuestion);

// Delete question (soft delete)
router.delete("/:questionId", deleteQuestion);

export default router;
