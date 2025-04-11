const mongoose = require('mongoose');

const buildingClassificationSchema = new mongoose.Schema({
  classType: {
    type: String,
    required: true,
    enum: ['Class_2', 'Class_3', 'Class_5', 'Class_6', 'Class_7', 'Class_8', 'Class_9a', 'Class_9b', 'Class_9c']
  },
  description: {
    type: String,
    required: true
  },
  subtypes: [{
    name: String,
    requirements: [String],
    thermalPerformance: Boolean,
    energyUsage: Boolean,
    specialRequirements: {
      fireSafety: Boolean,
      minorUseRule: Boolean,
      glazing: String,
      hvac: String,
      lighting: String
    }
  }],
  climateZones: [{
    zoneRange: String,
    insulation: String,
    wallRValue: String,
    roofRValue: String,
    glazing: {
      shgc: Number,
      uValue: Number
    }
  }],
  sizeBasedProvisions: {
    small: {
      maxArea: Number,
      provisions: String
    },
    mediumLarge: {
      minArea: Number,
      provisions: String
    }
  },
  compliancePathways: [{
    type: String,
    enum: ['DTS', 'JV3', 'NABERS']
  }],
  applicableClauses: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('BuildingClassification', buildingClassificationSchema); 