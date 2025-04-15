const mongoose = require('mongoose');

const climateZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Climate zone name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Climate zone code is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  temperatureRange: {
    min: {
      type: Number,
      required: [true, 'Minimum temperature is required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum temperature is required']
    }
  },
  humidityRange: {
    min: {
      type: Number,
      required: [true, 'Minimum humidity is required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum humidity is required']
    }
  },
  solarRadiation: {
    type: Number,
    required: [true, 'Solar radiation value is required']
  },
  windSpeed: {
    type: Number,
    required: [true, 'Wind speed value is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for code lookups
climateZoneSchema.index({ code: 1 });

module.exports = mongoose.model('ClimateZone', climateZoneSchema); 