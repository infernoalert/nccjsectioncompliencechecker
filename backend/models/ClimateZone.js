const mongoose = require('mongoose');

const ClimateZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
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
ClimateZoneSchema.index({ _id: 1 });

module.exports = mongoose.model('ClimateZone', ClimateZoneSchema); 