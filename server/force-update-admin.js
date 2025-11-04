/**
 * Force update admin password
 * This script deletes the existing admin and creates a new one with the updated password
 * Usage: node force-update-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;
const NEW_PASSWORD = 'chunguchi';

async function forceUpdateAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin
    const deleteResult = await User.deleteOne({ username: 'admin' });
    if (deleteResult.deletedCount > 0) {
      console.log('✅ Deleted existing admin user');
    } else {
      console.log('ℹ️  No existing admin user found');
    }

    // Create new admin with new password
    const admin = new User({
      username: 'admin',
      password: NEW_PASSWORD,
      role: 'admin'
    });
    await admin.save();
    console.log('✅ Created new admin user with updated password');

    console.log(`\n📝 New credentials:`);
    console.log(`   Username: admin`);
    console.log(`   Password: ${NEW_PASSWORD}\n`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

forceUpdateAdmin();

