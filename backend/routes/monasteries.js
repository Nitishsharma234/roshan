const express = require('express');
const Monastery = require('../models/Monastery');

const router = express.Router();

// Get all monasteries
router.get('/', async (req, res) => {
  try {
    const monasteries = await Monastery.find({ isActive: true })
      .select('name location images')
      .sort({ name: 1 });

    res.json(monasteries);
  } catch (error) {
    console.error('Get monasteries error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;