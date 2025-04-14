const mongoose = require('mongoose');

const ClimateZoneSchema = new mongoose.Schema({
  zone: {
    type: Number,
    required: [true, 'Please add a zone number'],
    unique: true,
    min: 1,
    max: 8
  },
  locations: [{
    type: String,
    required: [true, 'Please add at least one location']
  }],
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  insulation: {
    type: String,
    enum: ['standard', 'enhanced'],
    required: true
  },
  wallRValue: {
    type: String,
    required: true
  },
  roofRValue: {
    type: String,
    required: true
  },
  glazing: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  hvac: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
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
});

// Update the updatedAt timestamp before saving
ClimateZoneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
ClimateZoneSchema.index({ zone: 1 });
ClimateZoneSchema.index({ locations: 1 });

module.exports = mongoose.model('ClimateZone', ClimateZoneSchema); 