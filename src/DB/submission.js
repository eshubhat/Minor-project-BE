import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  selectedOption: {
    type: String,
    required: true,
  },
  correctOption: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  timeTaken: {
    type: Number,
    required: true, 
  },
});

const submissionSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: true,
  },
  candidateEmail: {
    type: String,
    required: true,
  },
  droneType: {
    type: String,
    required: true,
  },
  answers: {
    type: [answerSchema],
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalTimeTaken: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  }
});

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
