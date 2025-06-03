const mongoose = require('mongoose');

// Base schema for location properties
const locationBaseSchema = {
  state: {
    type: String,
    trim: true
  },
  postcode: {
    type: String,
    trim: true
  },
  climateZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClimateZone'
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  elevation: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
};

// Schema for embedded use (no required fields)
const embeddedLocationSchema = new mongoose.Schema(locationBaseSchema, { _id: false });

// Schema for standalone use (with additional fields)
const standaloneLocationSchema = new mongoose.Schema({
  ...locationBaseSchema,
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
  }
}, {
  timestamps: true
});

// Create compound index for unique location (only for standalone schema)
standaloneLocationSchema.index({ name: 1, state: 1, postcode: 1 }, { unique: true });

// Create index for climate zone lookups (only for standalone schema)
standaloneLocationSchema.index({ climateZone: 1 });

// Export both schemas and the model
module.exports = {
  embeddedSchema: embeddedLocationSchema,
  schema: standaloneLocationSchema,
  model: mongoose.model('Location', standaloneLocationSchema)
}; 