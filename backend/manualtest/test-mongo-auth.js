const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
};

// Test different connection strings
const testConnections = async () => {
  console.log('Testing MongoDB connections...\n');
  
  // Test 1: Without authentication
  try {
    console.log('Test 1: Without authentication');
    const uri1 = `mongodb://127.0.0.1:27017/ncc-compliance`;
    console.log(`Connection string: ${uri1}`);
    
    await mongoose.connect(uri1, options);
    console.log('✅ Connection successful without authentication!\n');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Connection failed without authentication:');
    console.log(`Error: ${error.message}\n`);
  }
  
  // Test 2: With authentication (using environment variables)
  try {
    console.log('Test 2: With authentication (using environment variables)');
    const uri2 = `mongodb://${process.env.MONGO_USER || 'your_local_user'}:${process.env.MONGO_PASSWORD || 'your_local_password'}@${process.env.MONGO_PATH || '127.0.0.1'}:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DATABASE || 'ncc-compliance'}`;
    console.log(`Connection string: ${uri2.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(uri2, options);
    console.log('✅ Connection successful with authentication!\n');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Connection failed with authentication:');
    console.log(`Error: ${error.message}\n`);
  }
  
  // Test 3: With authentication (hardcoded values)
  try {
    console.log('Test 3: With authentication (hardcoded values)');
    const uri3 = `mongodb://admin:password@127.0.0.1:27017/ncc-compliance`;
    console.log(`Connection string: ${uri3.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(uri3, options);
    console.log('✅ Connection successful with hardcoded authentication!\n');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Connection failed with hardcoded authentication:');
    console.log(`Error: ${error.message}\n`);
  }
  
  console.log('All tests completed.');
};

// Run the tests
testConnections()
  .then(() => {
    console.log('Test script completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Test script failed:', err);
    process.exit(1);
  }); 