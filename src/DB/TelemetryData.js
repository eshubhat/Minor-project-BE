import mongoose from "mongoose";

const telemetryAnalysisSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission",
    required: true,
    unique: true,
  },
  fileLink: {
    type: String,
    required: true,
  },
  analyzedBy: {
    type: String,
    required: true,
  },
  studentScore: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
  },
  processedData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
  isUpToDate: {
    type: Boolean,
    default: true,
  },
});

const TelemetryAnalysis = mongoose.model("TelemetryAnalysis", telemetryAnalysisSchema);

export default TelemetryAnalysis;
