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
  buildingType: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true,
    default: 'medium'
  },
  floorArea: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Floor area must be greater than 0'
    }
  },
  buildingClassification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BuildingClassification'
  },
  climateZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClimateZone'
  },
  buildingFabric: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BuildingFabric'
  },
  specialRequirements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpecialRequirement'
  }],
  compliancePathway: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompliancePathway'
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
projectSchema.index({ owner: 1 });

// Pre-save middleware to automatically set size based on floor area
projectSchema.pre('save', function(next) {
  if (this.floorArea) {
    if (this.floorArea < 500) {
      this.size = 'small';
    } else if (this.floorArea >= 500 && this.floorArea <= 2500) {
      this.size = 'medium';
    } else {
      this.size = 'large';
    }
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema); 