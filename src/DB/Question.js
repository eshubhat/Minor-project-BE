import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    correctOption: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return value < this.options.length;
        },
        message: "Correct option index must be less than options array length",
      },
    },
    droneType: {
      type: String,
      enum: ["micro", "small", "medium", "large"],
      required: true,
      index: true, // Index for faster filtering by drone type
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimized queries
questionSchema.index({ droneType: 1, isActive: 1 });
questionSchema.index({ createdBy: 1, droneType: 1 });
questionSchema.index({ difficulty: 1, droneType: 1 });

// Validation to ensure at least 2 options
questionSchema.pre("save", function (next) {
  if (this.options.length < 2) {
    next(new Error("Question must have at least 2 options"));
  } else {
    next();
  }
});

const Question = mongoose.model("Question", questionSchema);
export default Question;
