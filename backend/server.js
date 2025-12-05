const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ------------------------
// Security Middleware
// ------------------------
app.use(helmet());
app.use(cors({
  origin: '*', //process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// ------------------------
// Rate Limiting
// ------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// ------------------------
// Body Parser
// ------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ------------------------
// MongoDB Connection
// ------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// ------------------------
// Schemas & Models for Traveler Experiences
// ------------------------
const experienceSchema = new mongoose.Schema({
  image: String,
  userName: { type: String, default: "You" },
  userAvatar: { type: String, default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" },
  description: String,
  location: String,
  likes: { type: Number, default: 0 },
  chatEnabled: { type: Boolean, default: true },
  isLiked: { type: Boolean, default: false },
}, { timestamps: true });

const Experience = mongoose.model("Experience", experienceSchema);

// ------------------------
// Routes
// ------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/monasteries', require('./routes/monasteries'));
app.use('/api/audio-guides', require('./routes/audioGuides'));

// ------------------------
// Traveler Experiences Routes
// ------------------------
app.get('/api/experiences', async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ createdAt: -1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/experiences', async (req, res) => {
  try {
    const data = req.body;
    const newExp = new Experience(data);
    await newExp.save();
    res.status(201).json(newExp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------
// Like / Unlike Experience Route
// ------------------------
app.patch('/api/experiences/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id);
    if (!experience) return res.status(404).json({ error: "Experience not found" });

    // Toggle like
    experience.isLiked = !experience.isLiked;
    experience.likes = experience.isLiked ? experience.likes + 1 : experience.likes - 1;

    await experience.save();
    res.json(experience);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------
// Health Check
// ------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ------------------------
// ERROR HANDLER
// ------------------------
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// ------------------------
// 404 Handler
// ------------------------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ------------------------
// Start Server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
