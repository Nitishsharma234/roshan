
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true
},

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  participants: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  participantDetails: [{
    name: String,
    age: Number,
    nationality: String
  }],
  preferredLanguage: {
    type: String,
    required: true
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  qrCode: {
    data: String,
    expiresAt: Date
  },
  attendance: {
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkedInAt: Date,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  cancellation: {
    cancelled: Boolean,
    cancelledAt: Date,
    reason: String,
    refundAmount: Number
  }
}, {
  timestamps: true
});

// Generate booking ID before saving
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.bookingId = `MB${timestamp}${random}`;
    
    // Set QR code expiration (24 hours before event)
    const event = await mongoose.model('Event').findById(this.event);
    if (event) {
      const eventDate = new Date(event.date);
      this.qrCode.expiresAt = new Date(eventDate.getTime() - (24 * 60 * 60 * 1000));
    }
  }
  next();
});

// Indexes
//bookingSchema.index({ user: 1, createdAt: -1 });
//bookingSchema.index({ event: 1 });
bookingSchema.index({ bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
