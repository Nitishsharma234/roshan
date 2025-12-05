const Participation = require("../models/participation");

// Register for an event
exports.registerParticipation = async (req, res) => {
  try {
    const { event } = req.body;
    const participation = await Participation.create({
      user: req.user.id,
      event,
    });
    res.status(201).json({ success: true, data: participation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all participations for a user
exports.getUserParticipations = async (req, res) => {
  try {
    const participations = await Participation.find({ user: req.user.id }).populate("event");
    res.status(200).json({ success: true, data: participations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update participation status (admin/monk side)
exports.updateParticipationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const participation = await Participation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json({ success: true, data: participation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
