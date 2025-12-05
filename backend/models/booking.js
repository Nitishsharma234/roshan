const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // assuming you already have a User model
    required: true,
  },
  monastery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Monastery", // link with Monastery model
    required: true,
  },
  date: { type: Date, required: true },
  numberOfPeople: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
