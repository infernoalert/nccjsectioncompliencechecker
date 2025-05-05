const mongoose = require('mongoose');

const climateZoneSchema = new mongoose.Schema({
  zone: {
    type: String,
    required: [true, 'Climate zone is required'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  heatingDegreeHours: {
    type: Number,
    required: [true, 'Heating degree hours is required']
  },
  coolingDegreeHours: {
    type: Number,
    required: [true, 'Cooling degree hours is required']
  },
  dehumidificationGramHours: {
    type: Number,
    required: [true, 'Dehumidification gram hours is required']
  },
  locations: [{
    type: String,
    required: [true, 'At least one location is required']
  }],
  requirements: {
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

// Add index for efficient querying
climateZoneSchema.index({ zone: 1 });
climateZoneSchema.index({ locations: 1 });

const ClimateZone = mongoose.model('ClimateZone', climateZoneSchema);

module.exports = ClimateZone; 