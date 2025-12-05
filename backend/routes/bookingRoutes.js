const express = require("express");
const Booking = require("../models/booking"); // ensure this file exists
const { protect } = require("../middleware/authMiddleware"); // adjust path

const router = express.Router();

// Update booking status (admin only)
router.put("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Not authorized" });

    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
