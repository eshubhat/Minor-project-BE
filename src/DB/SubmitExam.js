import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  selectedOption: { type: Number, required: true, min: 0, max: 3 },
  correctOption: { type: Number, required: true, min: 0, max: 3 },
  isCorrect: { type: Boolean, required: true },
});

const studentExamSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🛠️ Fix: Check if model exists already
const StudentExamSubmission = mongoose.models.StudentExamSubmission || mongoose.model(
  "StudentExamSubmission",
  studentExamSubmissionSchema
);

export default StudentExamSubmission;
