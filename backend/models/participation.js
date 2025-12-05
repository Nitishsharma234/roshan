/*const mongoose = require("mongoose");

const participationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event", // you should already have Event model
    required: true,
  },
  status: {
    type: String,
    enum: ["registered", "attended", "cancelled"],
    default: "registered",
  },
}, { timestamps: true });

module.exports = mongoose.model("Participation", participationSchema);
*/