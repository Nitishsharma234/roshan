const mongoose = require('mongoose');

const monasterySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    address: String,
    city: String,
    state: {
      type: String,
      default: 'Sikkim'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  description: {
    type: String,
    required: true
  },
  history: String,
  architecture: String,
  significance: String,
  images: [String],
  contact: {
    phone: String,
    email: String,
    headMonk: String
  },
  facilities: [String],
  visitingHours: {
    opening: String,
    closing: String,
    specialNotes: String
  },
  rules: [String],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Monastery', monasterySchema);