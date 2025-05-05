const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true
  },
  subsection: {
    type: String,
    required: [true, 'Subsection is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  buildingTypes: [{
    type: String,
    required: [true, 'At least one building type is required'],
    enum: ['Class_1', 'Class_2', 'Class_3', 'Class_4', 'Class_5', 'Class_6', 'Class_7', 'Class_8', 'Class_9', 'Class_10']
  }],
  climateZones: [{
    type: String,
    required: [true, 'At least one climate zone is required']
  }],
  conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  calculations: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

// Add indexes for efficient querying
requirementSchema.index({ section: 1, subsection: 1 });
requirementSchema.index({ code: 1 });
requirementSchema.index({ buildingTypes: 1 });
requirementSchema.index({ climateZones: 1 });

const Requirement = mongoose.model('Requirement', requirementSchema);

module.exports = Requirement; 