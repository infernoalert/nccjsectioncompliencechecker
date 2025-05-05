const mongoose = require('mongoose');
const { MONGO_URI } = require('./env.config');

const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MongoDB URI is not defined');
    }

    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 