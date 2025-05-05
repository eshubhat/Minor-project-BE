import e from "express";
import {
  FetchAnalysis,
  FetchExamQuestions,
  SubmitExam,
} from "../controller/Student/Exam.js";

const router = e.Router();

router.post("/getExam/:type", FetchExamQuestions);
// router.post("/submitExam/:examId", SubmitExam);
router.post("/submitExam", SubmitExam);
router.get("/analytics/drone-types", FetchAnalysis);

export default router;
