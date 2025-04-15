const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  postcode: {
    type: String,
    required: [true, 'Postcode is required'],
    trim: true
  },
  climateZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClimateZone',
    required: [true, 'Climate zone is required']
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  elevation: {
    type: Number,
    required: [true, 'Elevation is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound index for unique location
locationSchema.index({ name: 1, state: 1, postcode: 1 }, { unique: true });

// Create index for climate zone lookups
locationSchema.index({ climateZone: 1 });

module.exports = mongoose.model('Location', locationSchema); 