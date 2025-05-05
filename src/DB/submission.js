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
    // NEW FIELD
    type: Number,
    required: true, // make it required to always track timing
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
    // NEW FIELD
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  telemetryData: {
    type: String,
  },
});

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
