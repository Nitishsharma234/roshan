const mongoose = require('mongoose');
const Monastery = require('../models/Monastery');
require('dotenv').config();

const sampleMonasteries = [
  {
    name: "Rumtek Monastery",
    location: {
      address: "Rumtek, Sikkim 737135",
      city: "Gangtok",
      state: "Sikkim",
      coordinates: {
        latitude: 27.2881,
        longitude: 88.5872
      }
    },
    description: "One of the most sacred and important monasteries in Sikkim, Rumtek Monastery is the seat of the Karma Kagyu lineage. It's known for its stunning architecture, sacred relics, and spiritual significance.",
    history: "Built in the 16th century by Wangchuk Dorje, the 9th Karmapa Lama. The monastery was rebuilt in 1960s after the original structure was damaged.",
    architecture: "Traditional Tibetan architecture with golden roofs, intricate murals, and prayer wheels.",
    significance: "Main seat of the Karma Kagyu lineage outside Tibet. Houses sacred relics including the Black Crown.",
    images: [
      "https://images.unsplash.com/photo-1547996166-1c48cb8dace8?w=500",
      "https://images.unsplash.com/photo-1547996160-6cac6bad5d66?w=500"
    ],
    contact: {
      phone: "+91-3592-123456",
      email: "rumtek@monastery.com",
      headMonk: "Khenpo Rinpoche"
    },
    facilities: ["Prayer Hall", "Meditation Center", "Library", "Guest House", "Museum"],
    visitingHours: {
      opening: "6:00 AM",
      closing: "6:00 PM",
      specialNotes: "Closed during special prayer ceremonies from 2-4 PM"
    },
    rules: [
      "No photography inside main prayer hall",
      "Dress modestly - cover shoulders and knees",
      "Maintain silence in meditation areas",
      "Remove shoes before entering temple",
      "No smoking or alcohol on premises"
    ],
    popularity: 95
  },
  {
    name: "Pemayangtse Monastery",
    location: {
      address: "Pemayangtse, West Sikkim 737111",
      city: "Geyzing",
      state: "Sikkim",
      coordinates: {
        latitude: 27.3078,
        longitude: 88.2406
      }
    },
    description: "One of the oldest and premier monasteries of Sikkim, Pemayangtse belongs to the Nyingma sect of Tibetan Buddhism. It offers breathtaking views of the Himalayan ranges.",
    history: "Established in 1705 by Lhatsun Chempo, one of the three revered Lamas who consecrated the first Chogyal of Sikkim.",
    architecture: "Traditional Buddhist architecture with seven-story structure and intricate wood carvings.",
    significance: "Second oldest monastery in Sikkim. Name means 'Perfect Sublime Lotus'.",
    images: [
      "https://images.unsplash.com/photo-1582484402618-49e6cf79bfb3?w=500",
      "https://images.unsplash.com/photo-1582484402800-44b291d2d613?w=500"
    ],
    contact: {
      phone: "+91-3595-234567",
      email: "pemayangtse@monastery.com",
      headMonk: "Lama Tashi"
    },
    facilities: ["Ancient Library", "Prayer Hall", "Museum", "Meditation Rooms"],
    visitingHours: {
      opening: "7:00 AM",
      closing: "5:00 PM",
      specialNotes: "Special prayers on full moon days"
    },
    rules: [
      "No loud conversations",
      "Respect prayer ceremonies",
      "Do not touch religious artifacts",
      "Make offerings respectfully"
    ],
    popularity: 88
  },
  {
    name: "Tashiding Monastery",
    location: {
      address: "Tashiding, West Sikkim 737111",
      city: "Yuksom",
      state: "Sikkim",
      coordinates: {
        latitude: 27.3250,
        longitude: 88.2600
      }
    },
    description: "Situated on top of a hill between Rathong and Rangeet rivers, Tashiding Monastery is considered one of the most sacred monasteries in Sikkim.",
    history: "Founded in 1641 by Ngadak Sempa Chempo Phuntsok Rigzing, one of the three Lamas who consecrated the first Chogyal of Sikkim.",
    architecture: "Traditional Buddhist architecture with white walls and golden pinnacle.",
    significance: "Bhumchu Ceremony held here is famous across Buddhist world. Considered highly sacred for blessings.",
    images: [
      "https://images.unsplash.com/photo-1547996166-82e6b45d6b8c?w=500",
      "https://images.unsplash.com/photo-1547996160-6cac6bad5d66?w=500"
    ],
    contact: {
      phone: "+91-3595-345678",
      email: "tashiding@monastery.com",
      headMonk: "Lama Dorje"
    },
    facilities: ["Main Temple", "Stupas", "Prayer Wheels", "Accommodation"],
    visitingHours: {
      opening: "6:30 AM",
      closing: "5:30 PM",
      specialNotes: "Best visited during Bhumchu Festival in February/March"
    },
    rules: [
      "Walk clockwise around stupas",
      "No photography during prayers",
      "Dress conservatively",
      "Seek permission before photography"
    ],
    popularity: 82
  },
  {
    name: "Enchey Monastery",
    location: {
      address: "Enchey, Gangtok, Sikkim 737101",
      city: "Gangtok",
      state: "Sikkim",
      coordinates: {
        latitude: 27.3412,
        longitude: 88.6282
      }
    },
    description: "A 200-year-old monastery located in Gangtok, known for its Chaam dances and beautiful location overlooking the city.",
    history: "Built in 1840, belongs to the Nyingma order of Vajrayana Buddhism. The monastery was blessed by Lama Druptob Karpo.",
    architecture: "Chinese pagoda style structure with vibrant colors and intricate designs.",
    significance: "Famous for its annual Chaam dance festival. Name means 'Solitary Temple'.",
    images: [
      "https://images.unsplash.com/photo-1547996160-6cac6bad5d66?w=500",
      "https://images.unsplash.com/photo-1582484402618-49e6cf79bfb3?w=500"
    ],
    contact: {
      phone: "+91-3592-456789",
      email: "enchey@monastery.com",
      headMonk: "Lama Tenzing"
    },
    facilities: ["Main Shrine", "Prayer Hall", "Monks Quarters", "Viewing Points"],
    visitingHours: {
      opening: "7:00 AM",
      closing: "4:00 PM",
      specialNotes: "Chaam dance festival in January/February"
    },
    rules: [
      "Maintain decorum",
      "No flash photography",
      "Respect monks' privacy",
      "Follow designated paths"
    ],
    popularity: 78
  },
  {
    name: "Phensang Monastery",
    location: {
      address: "Phensang, North Sikkim 737120",
      city: "Mangan",
      state: "Sikkim",
      coordinates: {
        latitude: 27.5167,
        longitude: 88.5667
      }
    },
    description: "A beautiful monastery belonging to the Nyingma sect, known for its serene environment and traditional architecture.",
    history: "Originally built in 1721, destroyed by fire and rebuilt in 1948. The monastery follows the Nyingma tradition.",
    architecture: "Traditional Tibetan architecture with colorful frescoes and intricate woodwork.",
    significance: "Important center for Buddhist learning and meditation in North Sikkim.",
    images: [
      "https://images.unsplash.com/photo-1547996166-82e6b45d6b8c?w=500",
      "https://images.unsplash.com/photo-1582484402800-44b291d2d613?w=500"
    ],
    contact: {
      phone: "+91-3592-567890",
      email: "phensang@monastery.com",
      headMonk: "Khenpo Wangyal"
    },
    facilities: ["Library", "Meditation Hall", "Monks School", "Guest Rooms"],
    visitingHours: {
      opening: "8:00 AM",
      closing: "5:00 PM",
      specialNotes: "Meditation sessions available on request"
    },
    rules: [
      "Silence in meditation areas",
      "No mobile phones in prayer hall",
      "Remove hats inside temple",
      "Follow monastery etiquette"
    ],
    popularity: 75
  }
];

const seedMonasteries = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI );
    console.log('Connected to MongoDB');

    // Clear existing data
    await Monastery.deleteMany({});
    console.log('Cleared existing monasteries');

    // Insert sample data
    await Monastery.insertMany(sampleMonasteries);
    console.log('Sample monasteries added successfully');

    // Display created monasteries
    const monasteries = await Monastery.find().select('name location.city');
    console.log('\nCreated Monasteries:');
    monasteries.forEach(monastery => {
      console.log(`- ${monastery.name} (${monastery.location.city})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding monasteries:', error);
    process.exit(1);
  }
};

seedMonasteries();