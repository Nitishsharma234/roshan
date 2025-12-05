// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const QRCode = require('qrcode');
// const Booking = require('../models/BookingModel');
// const Event = require('../models/Event');
// const { auth } = require('../middleware/auth');

// const router = express.Router();

// /* ===========================
//     CREATE BOOKING
// =========================== */
// router.post(
//   '/',
//   [
//     auth,
//     [
//       body('eventId').isMongoId().withMessage('Valid event ID required'),
//       body('participants')
//         .isInt({ min: 1, max: 10 })
//         .withMessage('Participants must be between 1 and 10'),
//       body('preferredLanguage')
//         .notEmpty()
//         .withMessage('Preferred language is required'),
//     ],
//   ],
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           message: 'Validation failed',
//           errors: errors.array(),
//         });
//       }

//       const {
//         eventId,
//         participants,
//         participantDetails,
//         preferredLanguage,
//         specialRequests,
//       } = req.body;

//       const event = await Event.findById(eventId);
//       if (!event || event.status !== 'active') {
//         return res.status(400).json({ message: 'Event not available' });
//       }

//       if (event.bookedSeats + participants > event.capacity) {
//         return res.status(400).json({ message: 'Not enough seats available' });
//       }

//       const existingBooking = await Booking.findOne({
//         user: req.user._id,
//         event: eventId,
//         status: 'confirmed',
//       });

//       if (existingBooking) {
//         return res
//           .status(400)
//           .json({ message: 'You already have a booking for this event' });
//       }

//       const totalAmount = event.price * participants;

//       const booking = new Booking({
//         user: req.user._id,
//         event: eventId,
//         participants,
//         participantDetails,
//         preferredLanguage,
//         specialRequests,
//         totalAmount,
//       });

//       await booking.save();

//       event.bookedSeats += participants;
//       await event.save();

//       await booking.populate('event', 'title date startTime endTime location monastery');
//       await booking.populate('user', 'name email phone');

//       res.status(201).json({
//         message: 'Booking created successfully',
//         booking,
//         paymentRequired: totalAmount > 0,
//       });
//     } catch (error) {
//       console.error('Create booking error:', error);
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   }
// );

// /* ===========================
//     GET MY BOOKINGS
// =========================== */
// router.get('/my-bookings', auth, async (req, res) => {
//   try {
//     const { status } = req.query;

//     let filter = { user: req.user._id };
//     if (status) filter.status = status;

//     let bookings = await Booking.find(filter)
//       .populate(
//         'event',
//         'title date startTime endTime location monastery type images'
//       )
//       .populate('user', 'name email phone')
//       .sort({ createdAt: -1 });

//     for (let b of bookings) {
//       if (
//         b.paymentStatus === 'paid' &&
//         b.qrCode?.expiresAt &&
//         new Date() < b.qrCode.expiresAt
//       ) {
//         const payload = {
//           bookingId: b.bookingId,
//           userId: b.user._id,
//           eventId: b.event._id,
//           valid: true,
//         };

//         b.qrCode.data = await QRCode.toDataURL(JSON.stringify(payload));
//       }
//     }

//     res.json({
//       bookings,
//       total: bookings.length,
//     });
//   } catch (error) {
//     console.error('Get bookings error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// /* ===========================
//     GET BOOKING DETAILS
// =========================== */
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//       .populate(
//         'event',
//         'title description date startTime endTime location monastery price images type'
//       )
//       .populate('user', 'name email phone');

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     if (
//       booking.user._id.toString() !== req.user._id.toString() &&
//       req.user.role !== 'admin' &&
//       req.user.role !== 'monastery_admin'
//     ) {
//       return res.status(403).json({ message: 'Unauthorized to view this booking' });
//     }

//     if (booking.paymentStatus === 'paid') {
//       const qrPayload = {
//         bookingId: booking.bookingId,
//         eventId: booking.event._id,
//         userId: booking.user._id,
//         valid: true,
//       };

//       booking.qrCode.data = await QRCode.toDataURL(JSON.stringify(qrPayload));
//       await booking.save();
//     }

//     res.json({ booking });
//   } catch (error) {
//     console.error("Get booking details error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// /* ===========================
//     CANCEL BOOKING (FULL FIXED)
// =========================== */
// router.put('/:id/cancel', auth, async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//       .populate('event')
//       .populate('user');

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     if (booking.user._id.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     if (booking.status === 'cancelled') {
//       return res.status(400).json({ message: 'Booking already cancelled' });
//     }

//     // 🔥 FIX: Validate event date
//     if (!booking.event.date) {
//       return res.status(400).json({ message: "Event date missing — cannot cancel booking" });
//     }

//     const eventDate = new Date(booking.event.date);
//     if (isNaN(eventDate.getTime())) {
//       return res.status(400).json({
//         message: "Invalid event date — cannot calculate refund",
//       });
//     }

//     const now = new Date();
//     const hrsDiff = (eventDate - now) / (1000 * 60 * 60);

//     // Refund logic
//     let refundAmount = 0;
//     if (hrsDiff > 24) refundAmount = booking.totalAmount * 0.8;
//     else if (hrsDiff > 12) refundAmount = booking.totalAmount * 0.5;
//     else refundAmount = 0;

//     // Update booking
//     booking.status = 'cancelled';
//     booking.cancellation = {
//       cancelled: true,
//       cancelledAt: now,
//       reason: req.body.reason || 'User cancelled',
//       refundAmount,
//     };

//     await booking.save();

//     // FIX: Safe seat update
//     const event = await Event.findById(booking.event._id);
//     if (event) {
//       event.bookedSeats = Math.max(event.bookedSeats - booking.participants, 0);
//       await event.save();
//     }

//     res.json({
//       message: 'Booking cancelled successfully',
//       refundAmount,
//     });

//   } catch (error) {
//     console.error('Cancel booking error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;






// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const QRCode = require('qrcode');
// const Booking = require('../models/BookingModel');
// const Event = require('../models/Event');
// const { auth } = require('../middleware/auth');

// const router = express.Router();

// /* ===========================
//     CREATE BOOKING
// =========================== */
// router.post(
//   '/',
//   [
//     auth,
//     [
//       body('eventId').isMongoId().withMessage('Valid event ID required'),
//       body('participants')
//         .isInt({ min: 1, max: 10 })
//         .withMessage('Participants must be between 1 and 10'),
//       body('preferredLanguage')
//         .notEmpty()
//         .withMessage('Preferred language is required'),
//     ],
//   ],
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           message: 'Validation failed',
//           errors: errors.array(),
//         });
//       }

//       const {
//         eventId,
//         participants,
//         participantDetails,
//         preferredLanguage,
//         specialRequests,
//       } = req.body;

//       const event = await Event.findById(eventId);
//       if (!event || event.status !== 'active') {
//         return res.status(400).json({ message: 'Event not available' });
//       }

//       if (event.bookedSeats + participants > event.capacity) {
//         return res.status(400).json({ message: 'Not enough seats available' });
//       }

//       const existingBooking = await Booking.findOne({
//         user: req.user._id,
//         event: eventId,
//         status: 'confirmed',
//       });

//       if (existingBooking) {
//         return res
//           .status(400)
//           .json({ message: 'You already have a booking for this event' });
//       }

//       const totalAmount = event.price * participants;

//       const booking = new Booking({
//         user: req.user._id,
//         event: eventId,
//         participants,
//         participantDetails,
//         preferredLanguage,
//         specialRequests,
//         totalAmount,
//       });

//       await booking.save();

//       event.bookedSeats += participants;
//       await event.save();

//       await booking.populate('event', 'title date startTime endTime location monastery');
//       await booking.populate('user', 'name email phone');

//       res.status(201).json({
//         message: 'Booking created successfully',
//         booking,
//         paymentRequired: totalAmount > 0,
//       });
//     } catch (error) {
//       console.error('Create booking error:', error);
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   }
// );

// /* ===========================
//     GET MY BOOKINGS
// =========================== */
// router.get('/my-bookings', auth, async (req, res) => {
//   try {
//     const { status } = req.query;

//     let filter = { user: req.user._id };
//     if (status) filter.status = status;

//     let bookings = await Booking.find(filter)
//       .populate(
//         'event',
//         'title date startTime endTime location monastery type images'
//       )
//       .populate('user', 'name email phone')
//       .sort({ createdAt: -1 });

//     for (let b of bookings) {
//       if (
//         b.paymentStatus === 'paid' &&
//         b.qrCode?.expiresAt &&
//         new Date() < b.qrCode.expiresAt
//       ) {
//         const payload = {
//           bookingId: b.bookingId,
//           userId: b.user._id,
//           eventId: b.event._id,
//           valid: true,
//         };

//         b.qrCode.data = await QRCode.toDataURL(JSON.stringify(payload));
//       }
//     }

//     res.json({
//       bookings,
//       total: bookings.length,
//     });
//   } catch (error) {
//     console.error('Get bookings error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// /* ===========================
//     GET BOOKING DETAILS
// =========================== */
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//       .populate(
//         'event',
//         'title description date startTime endTime location monastery price images type'
//       )
//       .populate('user', 'name email phone');

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     if (
//       booking.user._id.toString() !== req.user._id.toString() &&
//       req.user.role !== 'admin' &&
//       req.user.role !== 'monastery_admin'
//     ) {
//       return res.status(403).json({ message: 'Unauthorized to view this booking' });
//     }

//     if (booking.paymentStatus === 'paid') {
//       const qrPayload = {
//         bookingId: booking.bookingId,
//         eventId: booking.event._id,
//         userId: booking.user._id,
//         valid: true,
//       };

//       booking.qrCode.data = await QRCode.toDataURL(JSON.stringify(qrPayload));
//       await booking.save();
//     }

//     res.json({ booking });
//   } catch (error) {
//     console.error("Get booking details error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// /* ===========================
//     CANCEL BOOKING (FIXED)
// =========================== */
// router.put('/:id/cancel', auth, async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//       .populate('event')
//       .populate('user');

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     if (booking.user._id.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     if (booking.status === 'cancelled') {
//       return res.status(400).json({ message: 'Booking already cancelled' });
//     }

//     // ⭐ FIX: event can be null if deleted
//     // if (!booking.event) {
//     //   return res.status(400).json({
//     //     message: "Event no longer exists — cannot cancel this booking",
//     //   });
//     // }

//     if (!booking.event) {
//   booking.status = 'cancelled';
//   booking.cancellation = {
//     cancelled: true,
//     cancelledAt: now,
//     reason: req.body.reason || 'User cancelled',
//     refundAmount: 0
//   };

//   await booking.save();

//   return res.json({
//     message: "Booking cancelled (event already deleted)",
//     refundAmount: 0
//   });
// }


//     if (!booking.event.date) {
//       return res.status(400).json({
//         message: "Event date missing — cannot cancel booking",
//       });
//     }

//     const reason = req.body?.reason || "User cancelled the booking";

//     const eventDate = new Date(booking.event.date);
//     if (isNaN(eventDate.getTime())) {
//       return res.status(400).json({ message: "Invalid event date" });
//     }

//     const now = new Date();
//     const hrsDiff = (eventDate - now) / 3600000;

//     let refundAmount = 0;
//     if (hrsDiff > 24) refundAmount = booking.totalAmount * 0.8;
//     else if (hrsDiff > 12) refundAmount = booking.totalAmount * 0.5;

//     booking.status = 'cancelled';
//     booking.cancellation = {
//       reason,
//       cancelledAt: now,
//       refundAmount,
//     };

//     await booking.save();

//     // ⭐ FIX: event could be null — safe check
//     const event = await Event.findById(booking.event._id);
//     if (event) {
//       event.bookedSeats = Math.max(event.bookedSeats - booking.participants, 0);
//       await event.save();
//     }

//     res.json({
//       message: 'Booking cancelled successfully',
//       refundAmount,
//     });

//   } catch (error) {
//     console.error('Cancel booking error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;






const express = require('express');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const Booking = require('../models/BookingModel');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

const router = express.Router();

/* ===========================
    CREATE BOOKING
=========================== */
router.post(
  '/',
  [
    auth,
    [
      body('eventId').isMongoId().withMessage('Valid event ID required'),
      body('participants')
        .isInt({ min: 1, max: 10 })
        .withMessage('Participants must be between 1 and 10'),
      body('preferredLanguage')
        .notEmpty()
        .withMessage('Preferred language is required'),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const {
        eventId,
        participants,
        participantDetails,
        preferredLanguage,
        specialRequests,
      } = req.body;

      const event = await Event.findById(eventId);
      if (!event || event.status !== 'active') {
        return res.status(400).json({ message: 'Event not available' });
      }

      if (event.bookedSeats + participants > event.capacity) {
        return res.status(400).json({ message: 'Not enough seats available' });
      }

      const existingBooking = await Booking.findOne({
        user: req.user._id,
        event: eventId,
        status: 'confirmed',
      });

      if (existingBooking) {
        return res
          .status(400)
          .json({ message: 'You already have a booking for this event' });
      }

      const totalAmount = event.price * participants;

      const booking = new Booking({
        user: req.user._id,
        event: eventId,
        participants,
        participantDetails,
        preferredLanguage,
        specialRequests,
        totalAmount,
      });

      await booking.save();

      event.bookedSeats += participants;
      await event.save();

      await booking.populate('event', 'title date startTime endTime location monastery');
      await booking.populate('user', 'name email phone');

      res.status(201).json({
        message: 'Booking created successfully',
        booking,
        paymentRequired: totalAmount > 0,
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/* ===========================
    GET MY BOOKINGS
=========================== */
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { status } = req.query;

    let filter = { user: req.user._id };
    if (status) filter.status = status;

    let bookings = await Booking.find(filter)
      .populate(
        'event',
        'title date startTime endTime location monastery type images'
      )
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    for (let b of bookings) {
      if (
        b.paymentStatus === 'paid' &&
        b.qrCode?.expiresAt &&
        new Date() < b.qrCode.expiresAt
      ) {
        const payload = {
          bookingId: b.bookingId,
          userId: b.user._id,
          eventId: b.event._id,
          valid: true,
        };

        b.qrCode.data = await QRCode.toDataURL(JSON.stringify(payload));
      }
    }

    res.json({
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/* ===========================
    GET BOOKING DETAILS
=========================== */
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate(
        'event',
        'title description date startTime endTime location monastery price images type'
      )
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'monastery_admin'
    ) {
      return res.status(403).json({ message: 'Unauthorized to view this booking' });
    }

    if (booking.paymentStatus === 'paid') {
      const qrPayload = {
        bookingId: booking.bookingId,
        eventId: booking.event?._id,
        userId: booking.user._id,
        valid: true,
      };

      booking.qrCode.data = await QRCode.toDataURL(JSON.stringify(qrPayload));
      await booking.save();
    }

    res.json({ booking });
  } catch (error) {
    console.error("Get booking details error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ===========================
    CANCEL BOOKING (ORPHAN-SAFE)
=========================== */
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    const now = new Date();
    const reason = req.body?.reason || "User cancelled";

    /* -----------------------------------
       CASE 1: EVENT IS MISSING (ORPHAN)
    ----------------------------------- */
    if (!booking.event) {
      booking.status = 'cancelled';
      booking.cancellation = {
        cancelled: true,
        cancelledAt: now,
        reason,
        refundAmount: 0,
      };

      await booking.save();

      return res.json({
        message: "Booking cancelled (event no longer exists)",
        refundAmount: 0,
      });
    }

    /* -----------------------------------
       CASE 2: EVENT DATE IS MISSING
    ----------------------------------- */
    if (!booking.event.date) {
      booking.status = "cancelled";
      booking.cancellation = {
        cancelled: true,
        cancelledAt: now,
        reason: reason,
        refundAmount: 0
      };

      await booking.save();

      return res.json({
        message: "Booking cancelled (event date missing)",
        refundAmount: 0
      });
    }

    /* -----------------------------------
       NORMAL VALID CANCELLATION
    ----------------------------------- */
    const eventDate = new Date(booking.event.date);

    let refundAmount = 0;
    const hoursLeft = (eventDate - now) / (1000 * 60 * 60);

    if (hoursLeft > 24) refundAmount = booking.totalAmount * 0.8;
    else if (hoursLeft > 12) refundAmount = booking.totalAmount * 0.5;
    else refundAmount = 0;

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelled: true,
      cancelledAt: now,
      reason,
      refundAmount,
    };

    await booking.save();

    const event = await Event.findById(booking.event._id);
    if (event) {
      event.bookedSeats = Math.max(event.bookedSeats - booking.participants, 0);
      await event.save();
    }

    res.json({
      message: 'Booking cancelled successfully',
      refundAmount,
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
