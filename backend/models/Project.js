const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buildingClassification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BuildingClassification',
    required: true
  },
  climateZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClimateZone',
    required: true
  },
  buildingFabric: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BuildingFabric',
    required: true
  },
  specialRequirements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpecialRequirement'
  }],
  compliancePathway: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompliancePathway',
    required: true
  },
  complianceResults: {
    status: {
      type: String,
      enum: ['compliant', 'non_compliant', 'pending'],
      default: 'pending'
    },
    checks: [{
      requirement: String,
      status: {
        type: String,
        enum: ['compliant', 'non_compliant', 'pending']
      },
      details: String,
      documentation: [String]
    }],
    lastChecked: Date,
    nextReviewDate: Date
  },
  documentation: [{
    name: String,
    type: String,
    url: String,
    uploadDate: Date
  }],
  status: {
    type: String,
    enum: ['draft', 'in_review', 'approved', 'rejected'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Create indexes
projectSchema.index({ userId: 1 });
projectSchema.index({ buildingClass: 1 });
projectSchema.index({ climateZone: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ userId: 1, buildingClass: 1, climateZone: 1 });

module.exports = mongoose.model('Project', projectSchema); 