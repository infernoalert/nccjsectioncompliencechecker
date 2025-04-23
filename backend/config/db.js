const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Construct MongoDB URI from individual parameters
    const mongoUri = process.env.MONGODB_URI || `mongodb://${process.env.MONGO_PATH}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 