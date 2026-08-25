const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const ATLASDB_URL = process.env.ATLASDB_URL || 'mongodb://localhost:27017/wealthflow';
    const conn = await mongoose.connect(ATLASDB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;