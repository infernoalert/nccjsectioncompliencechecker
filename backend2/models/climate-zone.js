const mongoose = require('mongoose');

const climateZoneSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Climate zone code is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Climate zone name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    enum: ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']
  },
  temperatureRange: {
    summer: {
      min: Number,
      max: Number
    },
    winter: {
      min: Number,
      max: Number
    }
  },
  humidityRange: {
    summer: {
      min: Number,
      max: Number
    },
    winter: {
      min: Number,
      max: Number
    }
  },
  nccRequirements: {
    type: {
      heating: {
        required: Boolean,
        notes: String
      },
      cooling: {
        required: Boolean,
        notes: String
      },
      insulation: {
        required: Boolean,
        notes: String
      },
      ventilation: {
        required: Boolean,
        notes: String
      }
    },
    required: true
  },
  mapCoordinates: {
    type: {
      latitude: Number,
      longitude: Number
    }
  },
  postcodes: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
climateZoneSchema.index({ code: 1 });
climateZoneSchema.index({ state: 1 });
climateZoneSchema.index({ postcodes: 1 });

// Method to check if a postcode belongs to this climate zone
climateZoneSchema.methods.hasPostcode = function(postcode) {
  return this.postcodes.includes(postcode);
};

// Method to get climate zone requirements
climateZoneSchema.methods.getRequirements = function() {
  return this.nccRequirements;
};

module.exports = mongoose.model('ClimateZone', climateZoneSchema); 