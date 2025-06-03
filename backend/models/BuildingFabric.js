const mongoose = require('mongoose');

// Base schema for building fabric properties
const buildingFabricBaseSchema = {
  walls: {
    external: {
      rValueByZone: {
        Zones_1_3: String,
        Zones_4_6: String,
        Zones_7_8: String
      },
      thermalBreaks: {
        metalFramed: Boolean
      }
    }
  },
  roof: {
    rValueByZone: {
      Zones_1_5: String,
      Zone_6: String,
      Zones_7_8: String
    },
    solarAbsorptance: {
      max: {
        type: Number,
        default: 0.45
      },
      exemptZones: [String]
    }
  },
  floor: {
    rValueByZone: {
      Zones_1_3: String,
      Zones_4_6: String,
      Zones_7_8: String
    }
  },
  glazing: {
    external: {
      shgcByZone: {
        Zones_1_3: Number,
        Zones_4_6: Number,
        Zones_7_8: Number
      },
      uValueByZone: {
        Zones_1_3: Number,
        Zones_4_6: Number,
        Zones_7_8: Number
      }
    }
  }
};

// Schema for embedded use (no required fields)
const embeddedBuildingFabricSchema = new mongoose.Schema(buildingFabricBaseSchema, { _id: false });

// Schema for standalone use (with additional fields)
const standaloneBuildingFabricSchema = new mongoose.Schema({
  ...buildingFabricBaseSchema,
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  buildingType: {
    type: String,
    required: [true, 'Building type is required']
  },
  climateZone: {
    type: String,
    required: [true, 'Climate zone is required']
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

// Create indexes for standalone schema
standaloneBuildingFabricSchema.index({ buildingType: 1 });
standaloneBuildingFabricSchema.index({ climateZone: 1 });

// Update the updatedAt timestamp before saving
standaloneBuildingFabricSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export both schemas and the model
module.exports = {
  embeddedSchema: embeddedBuildingFabricSchema,
  schema: standaloneBuildingFabricSchema,
  model: mongoose.model('BuildingFabric', standaloneBuildingFabricSchema)
}; 