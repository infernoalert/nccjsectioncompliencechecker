const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log environment variables for debugging (without sensitive info)
    console.log('Database connection parameters:');
    console.log(`MONGO_PATH: ${process.env.MONGO_PATH ? 'Set' : 'Not set'}`);
    console.log(`MONGO_PORT: ${process.env.MONGO_PORT || 'Not set'}`);
    console.log(`MONGO_DATABASE: ${process.env.MONGO_DATABASE || 'Not set'}`);
    console.log(`MONGO_USER: ${process.env.MONGO_USER ? 'Set' : 'Not set'}`);
    
    // Construct MongoDB URI from individual parameters
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      // If username and password are provided, use authentication
      if (process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
        mongoUri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_PATH}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
      } else {
        mongoUri = `mongodb://${process.env.MONGO_PATH}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
      }
    }
    
    console.log(`Attempting to connect to MongoDB at: ${process.env.MONGO_PATH}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`);

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`Error details: ${JSON.stringify(error, null, 2)}`);
    
    // Don't exit the process immediately, let the application handle the error
    // This allows for better error reporting and potential recovery
    return null;
  }
};

module.exports = connectDB; 