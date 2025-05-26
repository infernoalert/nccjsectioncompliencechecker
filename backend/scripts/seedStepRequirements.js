const mongoose = require('mongoose');
const StepRequirement = require('../models/StepRequirement');
const { STEP_REQUIREMENTS } = require('../config/stepRequirements');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for seeding step requirements'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const seedStepRequirements = async () => {
  try {
    // Clear existing data
    await StepRequirement.deleteMany({});
    
    // Convert validation functions to strings
    const stepRequirements = Object.entries(STEP_REQUIREMENTS).map(([step, data]) => ({
      step,
      requiredFields: data.requiredFields.map(field => ({
        ...field,
        validation: field.validation.toString()
      })),
      requirementMessage: data.requirementMessage
    }));
    
    // Insert data
    await StepRequirement.insertMany(stepRequirements);
    console.log('Step requirements seeded successfully');
  } catch (error) {
    console.error('Error seeding step requirements:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the seeder
seedStepRequirements(); 