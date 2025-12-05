const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI );
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@monastery.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      name: 'System Admin',
      email: 'admin@monastery.com',
      password: 'admin1234', // This will be hashed automatically
      phone: '+91-9876543218',
      role: 'admin',
      isVerified: true
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@monastery.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();