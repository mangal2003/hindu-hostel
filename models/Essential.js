const mongoose = require("mongoose");

const essentialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ["Hospital", "Pharmacy", "Stationery", "General Store", "Other"],
  },
  address: { type: String, required: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  website: { type: String, trim: true },
  distance: { type: String }, // e.g., "500m" or "2km"
  isOpen247: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Essential", essentialSchema);
