import mongoose from "mongoose";

// Schema for a single question
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: [arrayLimit, "{PATH} must have exactly 4 options"],
    required: true,
  },
  correctOption: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  examDate: {
    type: Date,
    default: Date.now,
  },
});

// Validate options array length
function arrayLimit(val) {
  return val.length === 4;
}

// Schema for an exam
const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    questions: [questionSchema],
    teacher: {
      type: String,
      default: "teacher1",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    examDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
    },
    passScore: {
      type: Number,
      default: 35,
    },
    duration: {
      type: Number,
      default: 60
    }
  },
  { timestamps: true }
);

// Model
const Exam = mongoose.model("Exam", examSchema);

export default Exam;
