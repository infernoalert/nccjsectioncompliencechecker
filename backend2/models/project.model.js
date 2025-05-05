const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  buildingType: {
    type: String,
    required: [true, 'Building type is required'],
    enum: ['Class_1', 'Class_2', 'Class_3', 'Class_4', 'Class_5', 'Class_6', 'Class_7', 'Class_8', 'Class_9', 'Class_10']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  climateZone: {
    type: String,
    required: [true, 'Climate zone is required']
  },
  totalArea: {
    type: Number,
    required: [true, 'Total area is required']
  },
  totalHabitableArea: {
    type: Number,
    required: [true, 'Total habitable area is required']
  },
  buildingFabric: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  specialRequirements: [{
    type: String
  }],
  exemptions: [{
    type: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for frequently queried fields
projectSchema.index({ user: 1 });
projectSchema.index({ buildingType: 1 });
projectSchema.index({ climateZone: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project; 