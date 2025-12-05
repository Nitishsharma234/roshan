const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  monastery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monastery',
    required: true
  },
  type: {
    type: String,
    enum: [
      'guided_tour',
      'meditation_retreat',
      'cultural_workshop',
      'spiritual_teaching',
      'festival',
      'volunteer_activity'
    ],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  bookedSeats: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  languages: [String],
  guideInfo: {
    name: String,
    languages: [String],
    experience: String
  },
  requirements: [String],
  accommodationIncluded: {
    type: Boolean,
    default: false
  },
  accommodationDetails: {
    type: String
  },
  liveStreamAvailable: {
    type: Boolean,
    default: false
  },
  liveStreamLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  images: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ monastery: 1, date: 1 });
eventSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);
