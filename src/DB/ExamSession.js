import mongoose from "mongoose";

const examSessionSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  droneType: {
    type: String,
    enum: ["micro", "small", "medium", "large"],
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ["active", "completed", "expired"],
    default: "active"
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 1800 // Session expires after 30 minutes
  }
}, { 
  timestamps: true 
});

// Index for active sessions
examSessionSchema.index({ candidate: 1, status: 1 });
examSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ExamSession = mongoose.model("ExamSession", examSessionSchema);
export default ExamSession;