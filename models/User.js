const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["student", "admin", "warden"],
    default: "student",
  },

  enrollmentNumber: {
    type: String,
    sparse: true,
    unique: true,
  },

  roomNumber: {
    type: String,
    sparse: true,
  },

  adminId: {
    type: String,
    sparse: true,
    unique: true,
  },

  designation: {
    type: String,
    default: "Resident",
  },

  verificationToken: String,
  tokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: { type: Boolean, default: false },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
