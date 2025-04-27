import e from "express";
import { FetchExamQuestions, SubmitExam } from "../controller/Student/Exam.js";

const router = e.Router();

router.get("/getExam/:examId", FetchExamQuestions);
router.post("/submitExam/:examId", SubmitExam);

export default router;
