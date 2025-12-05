const mongoose = require('mongoose');

const AudioGuideSchema = new mongoose.Schema({
  title: String,
  monastery: String,
  durationText: String,
  narrator: String,
  description: String,
  type: String,
  offline: Boolean,
  premium: Boolean,

  imageUrl: String,

  audioFiles: {
    English: String,
    Hindi: String,
    Nepali: String,
    Bengali: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AudioGuide', AudioGuideSchema, "audioguide");