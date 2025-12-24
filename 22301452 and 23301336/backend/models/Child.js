const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide child name"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Please provide child age"],
      min: 0,
      max: 12,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    allergies: {
      type: [String],
      default: [],
    },
    medicalNotes: {
      type: String,
      default: "",
    },
    guardianInfo: {
      primaryGuardian: {
        name: String,
        relationship: String,
        phone: String,
        email: String,
      },
      secondaryGuardian: {
        name: String,
        relationship: String,
        phone: String,
        email: String,
      },
    },
    emergencyContacts: [
      {
        name: {
          type: String,
          required: true,
        },
        relationship: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        address: String,
      },
    ],
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "graduated"],
      default: "active",
    },
    photoUrl: {
      type: String,
      default: "",
    },
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

childSchema.index({ parent: 1 });

module.exports = mongoose.model("Child", childSchema);
