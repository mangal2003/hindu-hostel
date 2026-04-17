const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  studyMaterial: { type: [String], default: [] },
  resources: { type: [String], default: [] },
  previousPapers: { type: [String], default: [] },

  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Resource", resourceSchema);
