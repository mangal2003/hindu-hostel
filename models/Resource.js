const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  studyMaterial: { type: String, default: null },
  resources: { type: String, default: null },
  previousPapers: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Resource", resourceSchema);
