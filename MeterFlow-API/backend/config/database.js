const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("✅ MongoDB connected");
    const db = client.db("myDB");

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
