const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the BuildingClassification model
const BuildingClassification = require('../models/BuildingClassification');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define the building classifications
const buildingClassifications = [
  {
    classType: 'Class_1',
    description: 'Single dwelling or a secondary dwelling',
  },
  {
    classType: 'Class_2',
    description: 'Apartment buildings',
  },
  {
    classType: 'Class_3',
    description: 'Hotels, motels, etc.',
  },
  {
    classType: 'Class_5',
    description: 'Office buildings',
  },
  {
    classType: 'Class_6',
    description: 'Shops, restaurants, and cafés',
  },
  {
    classType: 'Class_7',
    description: 'Carparks, warehouses, and storage buildings',
  },
  {
    classType: 'Class_8',
    description: 'Factories, workshops, and processing buildings',
  },
  {
    classType: 'Class_9a',
    description: 'Healthcare buildings',
  },
  {
    classType: 'Class_9b',
    description: 'Public assembly buildings',
  },
  {
    classType: 'Class_9c',
    description: 'Aged care buildings',
  }
];

// Seed the building classifications
const seedBuildingClassifications = async () => {
  try {
    // Clear existing building classifications
    await BuildingClassification.deleteMany({});
    console.log('Cleared existing building classifications');

    // Insert new building classifications
    await BuildingClassification.insertMany(buildingClassifications);
    console.log('Building classifications seeded successfully');

    // Log the seeded classifications
    const classifications = await BuildingClassification.find({});
    console.log('Seeded classifications:');
    classifications.forEach(classification => {
      console.log(`- ${classification.classType}: ${classification.description}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding building classifications:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedBuildingClassifications(); 