import e from "express";
import {
  CreateExam,
  FetchExams,
  FetchExamDetails,
} from "../controller/Teacher/Exam.js";

const router = e.Router();

router.post("/createExam", CreateExam);
router.get("/fetchExams/:teacherName", FetchExams);
router.get("/fetchExamDetails/:examId", FetchExamDetails);

export default router;
