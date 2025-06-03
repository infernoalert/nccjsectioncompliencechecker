const mongoose = require('mongoose');

// Base schema for climate zone properties
const climateZoneBaseSchema = {
  temperatureRange: {
    min: {
      type: Number
    },
    max: {
      type: Number
    }
  },
  humidityRange: {
    min: {
      type: Number
    },
    max: {
      type: Number
    }
  },
  solarRadiation: {
    type: Number
  },
  windSpeed: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
};

// Schema for embedded use (no required fields)
const embeddedClimateZoneSchema = new mongoose.Schema(climateZoneBaseSchema, { _id: false });

// Schema for standalone use (with additional fields)
const standaloneClimateZoneSchema = new mongoose.Schema({
  ...climateZoneBaseSchema,
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
  }
}, {
  timestamps: true
});

// Create index for code lookups (only for standalone schema)
standaloneClimateZoneSchema.index({ code: 1 });

// Export both schemas and the model
module.exports = {
  embeddedSchema: embeddedClimateZoneSchema,
  schema: standaloneClimateZoneSchema,
  model: mongoose.model('ClimateZone', standaloneClimateZoneSchema)
}; 