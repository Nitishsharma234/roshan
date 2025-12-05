const express = require('express');
const AudioGuide = require('../models/AudioGuide');

const router = express.Router();

// GET all audio guides
router.get('/', async (req, res) => {
  try {
    const guides = await AudioGuide.find();
    res.json(guides);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load audio guides' });
  }
});

module.exports = router;