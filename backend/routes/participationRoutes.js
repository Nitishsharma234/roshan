const express = require("express");
const Participation = require("../models/participation"); // ensure this file exists
const { protect } = require("../middleware/authMiddleware"); // adjust path

const router = express.Router();

// Update participation status (admin only)
router.put("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Not authorized" });

    const { status } = req.body;
    const participation = await Participation.findById(req.params.id);
    if (!participation) return res.status(404).json({ message: "Participation not found" });

    participation.status = status;
    await participation.save();

    res.json(participation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
