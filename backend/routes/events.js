const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Monastery = require('../models/Monastery');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all events with filtering

// Get all events with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      monastery, 
      type, 
      date, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    let filter = { status: 'active' };

    // Handle monastery filter - support both name and ObjectId
    if (monastery) {
      // Check if it's a valid ObjectId
      if (monastery.match(/^[0-9a-fA-F]{24}$/)) {
        filter.monastery = monastery;
      } else {
        // Search by monastery name
        const monasteryDoc = await Monastery.findOne({ 
          name: new RegExp(monastery, 'i') 
        });
        if (monasteryDoc) {
          filter.monastery = monasteryDoc._id;
        } else {
          // If monastery not found, return empty results
          return res.json({
            events: [],
            totalPages: 0,
            currentPage: page,
            total: 0
          });
        }
      }
    }

    if (type) filter.type = type;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(filter)
      .populate('monastery', 'name location images')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('monastery', 'name location contact facilities images');

    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    res.json(event);

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});



// Delete event (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      message: 'Event deleted successfully',
      eventId: req.params.id,
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
});

// Create event (Admin only)
router.post('/', [adminAuth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('monastery').isMongoId().withMessage('Valid monastery ID required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const eventData = req.body;
    eventData.createdBy = req.user._id;

    const event = new Event(eventData);
    await event.save();

    await event.populate('monastery', 'name location');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update event (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      event[key] = updates[key];
    });

    await event.save();
    await event.populate('monastery', 'name location');

    res.json({
      message: 'Event updated successfully',
      event
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get available seats for an event
router.get('/:id/availability', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    const availableSeats = event.capacity - event.bookedSeats;

    res.json({
      eventId: event._id,
      totalCapacity: event.capacity,
      bookedSeats: event.bookedSeats,
      availableSeats,
      isAvailable: availableSeats > 0
    });

  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;