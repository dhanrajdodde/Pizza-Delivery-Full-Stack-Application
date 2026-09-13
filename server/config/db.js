const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pizzaverse';
  
  try {
    console.log(`Connecting to MongoDB at: ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`MongoDB Connected successfully: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`Standard MongoDB connection to ${uri} failed: ${err.message}`);
    console.log(`Starting embedded MongoMemoryServer for instant zero-config database...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'pizzaverse'
        }
      });
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`Embedded MongoMemoryServer connected successfully at: ${memoryUri}`);
    } catch (memErr) {
      console.error(`Embedded MongoMemoryServer startup error: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
