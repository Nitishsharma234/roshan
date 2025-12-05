const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/BookingModel');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
    try {
        const { bookingId, amount, currency = 'INR' } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency,
            receipt: `receipt_${bookingId}`,
            notes: {
                bookingId: bookingId,
                userId: req.user._id.toString()
            }
        };

        const order = await razorpay.orders.create(options);

        // Update booking with Razorpay order ID
        booking.razorpayOrderId = order.id;
        await booking.save();

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            message: 'Payment order creation failed',
            error: error.message
        });
    }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Signature verified - update booking
            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({
                    message: 'Booking not found'
                });
            }

            booking.paymentStatus = 'paid';
            booking.razorpayPaymentId = razorpay_payment_id;
            booking.razorpaySignature = razorpay_signature;

            await booking.save();

            // Generate QR code for the booking
            const QRCode = require('qrcode');
            const qrData = {
                bookingId: booking.bookingId,
                userId: booking.user.toString(),
                eventId: booking.event.toString(),
                valid: true
            };

            booking.qrCode.data = await QRCode.toDataURL(JSON.stringify(qrData));
            await booking.save();

            res.json({
                success: true,
                message: 'Payment verified successfully',
                bookingId: booking._id
            });

        } else {
            res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            message: 'Payment verification failed',
            error: error.message
        });
    }
});

// Get payment status
router.get('/status/:bookingId', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }

        res.json({
            paymentStatus: booking.paymentStatus,
            amount: booking.totalAmount,
            bookingId: booking._id
        });

    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;