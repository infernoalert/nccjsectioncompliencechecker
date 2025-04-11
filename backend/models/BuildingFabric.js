const mongoose = require('mongoose');

const buildingFabricSchema = new mongoose.Schema({
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
}, {
  timestamps: true
});

module.exports = mongoose.model('BuildingFabric', buildingFabricSchema); 