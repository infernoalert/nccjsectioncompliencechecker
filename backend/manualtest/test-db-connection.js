const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection string
const mongoUri = process.env.MONGODB_URI || 
  `mongodb://${process.env.MONGO_PATH || 'localhost'}:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DATABASE || 'nccj'}`;

console.log('Testing MongoDB connection...');
console.log(`Connection string: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);

// Connect to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
})
.then(() => {
  console.log('MongoDB connection successful!');
  console.log(`Connected to: ${mongoose.connection.host}`);
  
  // List all collections
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('Error listing collections:', err);
    } else {
      console.log('Collections in database:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    // Close the connection
    mongoose.connection.close();
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 