const mongoose = require('mongoose');
const Monastery = require('../models/Monastery');
require('dotenv').config();

const sampleMonasteries = [
  {
    name: "Rumtek Monastery",
    location: {
      address: "Rumtek, Sikkim",
      city: "Gangtok",
      state: "Sikkim",
      coordinates: {
        latitude: 27.2881,
        longitude: 88.5872
      }
    },
    description: "One of the most sacred and important monasteries in Sikkim, known for its beautiful architecture and spiritual significance.",
    history: "Built in the 16th century, it's the seat of the Karma Kagyu lineage.",
    images: ["rumtek1.jpg", "rumtek2.jpg"],
    contact: {
      phone: "+91-1234567890",
      email: "rumtek@monastery.com",
      headMonk: "Khenpo Rinpoche"
    },
    facilities: ["Prayer Hall", "Meditation Center", "Library", "Guest House"],
    visitingHours: {
      opening: "6:00 AM",
      closing: "6:00 PM",
      specialNotes: "Closed during special prayer ceremonies"
    },
    rules: ["No photography inside main prayer hall", "Dress modestly", "Maintain silence"]
  },
  {
    name: "Pemayangtse Monastery",
    location: {
      address: "Pemayangtse, West Sikkim",
      city: "Geyzing",
      state: "Sikkim"
    },
    description: "One of the oldest and premier monasteries of Sikkim, known for its ancient scriptures and artifacts.",
    history: "Established in 1705, it belongs to the Nyingma sect of Tibetan Buddhism.",
    images: ["pemayangtse1.jpg"],
    facilities: ["Ancient Library", "Prayer Hall", "Museum"],
    visitingHours: {
      opening: "7:00 AM",
      closing: "5:00 PM"
    }
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/monastery-booking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Monastery.deleteMany({});
    console.log('Cleared existing monasteries');

    // Insert sample data
    await Monastery.insertMany(sampleMonasteries);
    console.log('Sample monasteries added successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();