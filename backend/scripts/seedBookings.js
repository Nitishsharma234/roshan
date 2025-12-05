const mongoose = require('mongoose');
const Booking = require('../models/BookingRoute');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

const seedBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/monastery-booking');
    console.log('Connected to MongoDB');

    // Get events and create a test user
    const events = await Event.find().limit(3);
    let user = await User.findOne({ email: 'test@tourist.com' });

    if (!user) {
      user = new User({
        name: 'Test Tourist',
        email: 'test@tourist.com',
        password: 'test123',
        phone: '+91-9876543211',
        nationality: 'Indian'
      });
      await user.save();
      console.log('Test user created');
    }

    if (events.length === 0) {
      console.log('No events found. Please seed events first.');
      process.exit(1);
    }

    // Clear existing bookings
    await Booking.deleteMany({});
    console.log('Cleared existing bookings');

    // Create sample bookings
    const sampleBookings = [
      {
        user: user._id,
        event: events[0]._id,
        participants: 2,
        preferredLanguage: 'English',
        totalAmount: events[0].price * 2,
        paymentStatus: 'paid'
      },
      {
        user: user._id,
        event: events[1]._id,
        participants: 1,
        preferredLanguage: 'Hindi',
        totalAmount: events[1].price * 1,
        paymentStatus: 'paid'
      }
    ];

    await Booking.insertMany(sampleBookings);
    console.log('Sample bookings created successfully');

    // Update event booked seats
    for (const booking of sampleBookings) {
      await Event.findByIdAndUpdate(
        booking.event,
        { $inc: { bookedSeats: booking.participants } }
      );
    }

    console.log('Event capacities updated');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding bookings:', error);
    process.exit(1);
  }
};

seedBookings();