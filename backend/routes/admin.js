const express = require('express');
const Booking = require('../models/BookingModel');
const Event = require('../models/Event');
const Monastery = require('../models/Monastery');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                      🔍 VERIFY QR CODE (ADMIN ONLY)                        */
/* -------------------------------------------------------------------------- */

router.post('/verify-qr', adminAuth, async (req, res) => {
  try {
    const { qrData } = req.body;

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { bookingId, valid } = parsedData;

    if (!valid) return res.status(400).json({ message: 'Invalid QR code' });

    const booking = await Booking.findOne({ bookingId })
      .populate({
        path: "event",
        select: "title date startTime monastery",
        populate: { path: "monastery", select: "name" }
      })
      .populate("user", "name email phone");

    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    // ❌ Cancelled OR Completed bookings should not scan
    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: "Booking is not active" });
    }

    // ❌ Payment not completed
    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Payment pending" });
    }

    // ❌ QR expired
    if (new Date() > booking.qrCode.expiresAt) {
      return res.status(400).json({ message: 'QR code expired' });
    }

    // ❌ Already checked in
    if (booking.attendance.checkedIn) {
      return res.status(400).json({ message: 'Already checked in' });
    }

    // ✔ Mark attendance
    booking.attendance = {
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInBy: req.user._id
    };

    await booking.save();

    res.json({
      success: true,
      message: "Attendance marked successfully",
      booking: {
        bookingId: booking.bookingId,
        user: booking.user.name,
        event: booking.event.title,
        participants: booking.participants
      }
    });

  } catch (error) {
    console.error('QR verification error:', error);
    res.status(500).json({ message: 'QR verification failed', error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                           📊 ADMIN ANALYTICS                               */
/* -------------------------------------------------------------------------- */

router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case 'day': startDate = new Date(now.setHours(0, 0, 0, 0)); break;
      case 'week': startDate = new Date(now.setDate(now.getDate() - 7)); break;
      case 'month': startDate = new Date(now.setMonth(now.getMonth() - 1)); break;
      case 'year': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      default: startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const totalBookings = await Booking.countDocuments({ createdAt: { $gte: startDate } });

    const revenueData = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({ period, totalBookings, totalRevenue });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Analytics failed', error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                         📘 ADMIN GET ALL BOOKINGS                           */
/* -------------------------------------------------------------------------- */

router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const { status, eventId } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (eventId) filter.event = eventId;

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate({
        path: "event",
        select: "title date type monastery",
        populate: { path: "monastery", select: "name" }
      })
      .sort({ createdAt: -1 });

    res.json({ bookings });

  } catch (error) {
    console.error('Admin bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                         ✏ UPDATE BOOKING STATUS                             */
/* -------------------------------------------------------------------------- */

router.put('/bookings/:id', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const { status } = req.body;
    if (status) booking.status = status;

    await booking.save();

    res.json({ message: "Booking status updated", booking });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Failed to update booking', error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                         🏯 ADMIN GET EVENTS                                 */
/* -------------------------------------------------------------------------- */

router.get('/events', adminAuth, async (req, res) => {
  try {
    const events = await Event.find()
      .populate("monastery", "name location")
      .populate("createdBy", "name email");

    res.json({ events });

  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

module.exports = router;
