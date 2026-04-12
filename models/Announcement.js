const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["College", "Hostel"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: "40d" },
  },
});

module.exports = mongoose.model("Announcement", announcementSchema);
