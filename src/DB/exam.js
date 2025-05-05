// models/Question.js

import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true },
  type: {
    type: String,
    enum: ["micro", "small", "medium", "large"],
    required: true,
  },
});

const Question = new mongoose.Schema(
  {
    questions: [questionSchema],
  },
  { timestamps: true }
);

const QuestionSet = mongoose.model("QuestionSet", Question);
export default QuestionSet;
