const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log environment variables for debugging (without sensitive info)
    console.log('Database connection parameters:');
    console.log(`MONGO_PATH: ${process.env.MONGO_PATH ? process.env.MONGO_PATH : 'Not set'}`);
    console.log(`MONGO_PORT: ${process.env.MONGO_PORT || 'Not set'}`);
    console.log(`MONGO_DATABASE: ${process.env.MONGO_DATABASE || 'Not set'}`);
    console.log(`MONGO_USER: ${process.env.MONGO_USER ? 'Set' : 'Not set'}`);
    console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
    
    // Construct MongoDB URI from individual parameters
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      // If username and password are provided and not empty, use authentication
      if (process.env.MONGO_USER && process.env.MONGO_PASSWORD && 
          process.env.MONGO_USER.trim() !== '' && process.env.MONGO_PASSWORD.trim() !== '') {
        // URL encode the username and password to handle special characters
        const encodedUser = encodeURIComponent(process.env.MONGO_USER);
        const encodedPassword = encodeURIComponent(process.env.MONGO_PASSWORD);
        mongoUri = `mongodb://${encodedUser}:${encodedPassword}@${process.env.MONGO_PATH}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
      } else {
        // No authentication
        mongoUri = `mongodb://${process.env.MONGO_PATH}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
      }
    }
    
    console.log(`Attempting to connect to MongoDB at: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`Error details:`, error);
    
    // Don't exit the process immediately, let the application handle the error
    // This allows for better error reporting and potential recovery
    throw error; // Re-throw to let the caller handle it
  }
};

module.exports = connectDB; 