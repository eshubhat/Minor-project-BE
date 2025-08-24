import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true
  },
  question: {
    type: String,
    required: true
  },
  selectedOption: {
    type: Number, // Changed to Number to match correctOption
    required: true
  },
  correctOption: {
    type: Number, // Changed to Number for consistency
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0 // Time in seconds
  }
}, { _id: false }); // Disable _id for subdocuments

const submissionSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  candidateName: {
    type: String,
    required: true,
    trim: true
  },
  candidateEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  droneType: {
    type: String,
    enum: ["micro", "small", "medium", "large"],
    required: true
  },
  answers: {
    type: [answerSchema],
    required: true,
    validate: {
      validator: function(answers) {
        return answers.length <= 10; // Maximum 10 questions per exam
      },
      message: 'Maximum 10 questions allowed per exam'
    }
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalTimeTaken: {
    type: Number,
    required: true,
    min: 0 // Total time in seconds
  },
  status: {
    type: String,
    enum: ["completed", "abandoned"],
    default: "completed"
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  examDuration: {
    type: Number, // Expected exam duration in seconds
    default: 600 // 10 minutes default
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
submissionSchema.index({ candidate: 1, submittedAt: -1 });
submissionSchema.index({ droneType: 1, submittedAt: -1 });
submissionSchema.index({ score: 1 });
submissionSchema.index({ submittedAt: -1 });

// Pre-save middleware to calculate percentage
submissionSchema.pre('save', function(next) {
  if (this.answers.length > 0) {
    this.percentage = Math.round((this.score / this.answers.length) * 100);
  }
  next();
});

const Submission = mongoose.model("NewSubmission", submissionSchema);
export default Submission;