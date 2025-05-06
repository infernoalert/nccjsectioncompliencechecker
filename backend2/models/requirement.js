const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Requirement code is required'],
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
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['fire', 'accessibility', 'acoustic', 'energy', 'other']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['mandatory', 'optional', 'conditional']
  },
  nccReference: {
    type: String,
    required: [true, 'NCC reference is required']
  },
  buildingClasses: [{
    type: String,
    enum: ['Class_1', 'Class_2', 'Class_3', 'Class_4', 'Class_5', 'Class_6', 'Class_7', 'Class_8', 'Class_9', 'Class_10']
  }],
  climateZones: [{
    type: String,
    ref: 'ClimateZone'
  }],
  requirements: {
    type: [{
      description: String,
      criteria: String,
      verification: String,
      notes: String
    }],
    required: true
  },
  documentation: {
    type: [{
      name: String,
      description: String,
      required: Boolean
    }]
  },
  complianceCriteria: {
    type: [{
      criterion: String,
      method: String,
      threshold: mongoose.Schema.Types.Mixed,
      unit: String
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: String,
    required: [true, 'Version is required']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
requirementSchema.index({ code: 1 });
requirementSchema.index({ type: 1 });
requirementSchema.index({ category: 1 });
requirementSchema.index({ buildingClasses: 1 });
requirementSchema.index({ climateZones: 1 });

// Method to check if requirement applies to a building class
requirementSchema.methods.appliesToBuildingClass = function(buildingClass) {
  return this.buildingClasses.includes(buildingClass);
};

// Method to check if requirement applies to a climate zone
requirementSchema.methods.appliesToClimateZone = function(climateZone) {
  return this.climateZones.includes(climateZone);
};

// Method to get compliance criteria
requirementSchema.methods.getComplianceCriteria = function() {
  return this.complianceCriteria;
};

module.exports = mongoose.model('Requirement', requirementSchema); 