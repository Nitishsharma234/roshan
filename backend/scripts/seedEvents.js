const mongoose = require('mongoose');
const Event = require('../models/Event');
const Monastery = require('../models/Monastery');
const User = require('../models/User');
require('dotenv').config();

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get admin user and monasteries
    const admin = await User.findOne({ email: 'admin@monastery.com' });
    const monasteries = await Monastery.find();

    if (!admin) {
      console.log('Admin user not found. Please create admin first.');
      process.exit(1);
    }

    if (monasteries.length === 0) {
      console.log('No monasteries found. Please seed monasteries first.');
      process.exit(1);
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Sample events
    const sampleEvents = [
      {
        title: "Morning Meditation Retreat",
        description: "Experience the serenity of Rumtek Monastery with our guided morning meditation session.",
        monastery: monasteries[0]._id,
        type: "meditation_retreat",
        date: new Date(Date.now() + 2 * 86400000),
        startTime: "06:00",
        endTime: "08:00",
        location: "Rumtek Monastery Main Hall",
        capacity: 30,
        price: 200,
        languages: ["English", "Hindi", "Tibetan"],
        guideInfo: {
          name: "Lama Tenzin",
          languages: ["English", "Tibetan"],
          experience: "15 years of meditation teaching experience"
        },
        requirements: ["Comfortable clothing", "Yoga mat", "Water bottle"],
        createdBy: admin._id
      },
      {
        title: "Guided Monastery Tour",
        description: "Explore the magnificent Rumtek Monastery with our expert guides.",
        monastery: monasteries[0]._id,
        type: "guided_tour",
        date: new Date(Date.now() + 3 * 86400000),
        startTime: "10:00",
        endTime: "12:00",
        location: "Rumtek Monastery Complex",
        capacity: 25,
        price: 150,
        languages: ["English", "Hindi"],
        guideInfo: {
          name: "Karma Wangchuk",
          languages: ["English", "Hindi", "Nepali"],
          experience: "Certified monastery guide with 8 years experience"
        },
        requirements: ["Comfortable shoes", "Camera (optional)"],
        createdBy: admin._id
      },

      {
        title: "Traditional Thangka Painting Workshop",
        description: "Learn the ancient art of Thangka painting from master artists.",
        monastery: monasteries[1]._id,
        type: "cultural_workshop",
        date: new Date(Date.now() + 5 * 86400000),
        startTime: "09:00",
        endTime: "13:00",
        location: "Pemayangtse Monastery Art Center",
        capacity: 15,
        price: 500,
        languages: ["English", "Hindi"],
        guideInfo: {
          name: "Artist Pemba",
          languages: ["English", "Tibetan"],
          experience: "Master Thangka artist with 20 years experience"
        },
        requirements: ["No prior experience needed", "All materials provided"],
        createdBy: admin._id
      },
      {
        title: "Spiritual Teaching Session",
        description: "Deepen your understanding of Buddhist philosophy with our spiritual teaching session.",
        monastery: monasteries[1]._id,
        type: "spiritual_teaching",
        date: new Date(Date.now() + 7 * 86400000),
        startTime: "14:00",
        endTime: "16:00",
        location: "Pemayangtse Monastery Library",
        capacity: 20,
        price: 100,
        languages: ["English", "Hindi"],
        guideInfo: {
          name: "Rinpoche Dorje",
          languages: ["English", "Tibetan", "Hindi"],
          experience: "Buddhist scholar and teacher"
        },
        requirements: ["Open mind", "Notebook (optional)"],
        createdBy: admin._id
      },

      {
        title: "Weekend Meditation Retreat",
        description: "A full weekend of meditation in the sacred environment of Tashiding Monastery.",
        monastery: monasteries[2]._id,
        type: "meditation_retreat",
        date: new Date(Date.now() + 10 * 86400000),
        startTime: "07:00",
        endTime: "17:00",
        location: "Tashiding Monastery Retreat Center",
        capacity: 20,
        price: 1200,
        languages: ["English", "Hindi"],
        accommodationIncluded: true,
        accommodationDetails: "Shared accommodation with vegetarian meals included",
        guideInfo: {
          name: "Lama Choden",
          languages: ["English", "Tibetan"],
          experience: "Retreat leader with 12 years experience"
        },
        requirements: ["Comfortable clothing", "Personal toiletries", "Meditation cushion"],
        createdBy: admin._id
      },

      {
        title: "Monastery Festival Celebration",
        description: "Annual monastery festival with traditional dances, prayers, and cultural performances.",
        monastery: monasteries[3]._id,
        type: "festival",
        date: new Date(Date.now() + 14 * 86400000),
        startTime: "08:00",
        endTime: "18:00",
        location: "Enchey Monastery Courtyard",
        capacity: 100,
        price: 0,
        languages: ["English", "Hindi", "Nepali"],
        guideInfo: {
          name: "Festival Committee",
          languages: ["English", "Hindi", "Nepali"],
          experience: "Annual festival organizers"
        },
        requirements: ["Traditional dress welcome", "Bring offering if desired"],
        createdBy: admin._id
      },

      {
        title: "Volunteer for Monastery Preservation",
        description: "Help preserve and maintain the ancient Phensang Monastery.",
        monastery: monasteries[4]._id,
        type: "volunteer_activity",
        date: new Date(Date.now() + 86400000),
        startTime: "08:00",
        endTime: "12:00",
        location: "Phensang Monastery Grounds",
        capacity: 15,
        price: 0,
        languages: ["English", "Hindi"],
        guideInfo: {
          name: "Volunteer Coordinator",
          languages: ["English", "Hindi"],
          experience: "Monastery preservation expert"
        },
        requirements: ["Work clothes", "Gloves", "Water bottle"],
        createdBy: admin._id
      }
    ];

    await Event.insertMany(sampleEvents);
    console.log('Sample events created successfully');

    // Display created events (fixed select)
    const events = await Event.find()
      .populate('monastery', 'name')
      .select('title monastery date type price');

    console.log('\nCreated Events:');
    events.forEach(event => {
      console.log(`- ${event.title} (${event.monastery.name}) - ${event.date.toDateString()} - ₹${event.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
