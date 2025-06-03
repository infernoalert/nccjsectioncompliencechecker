const mongoose = require('mongoose');

const electricalSchema = new mongoose.Schema({
  loads: [{
    type: {
      type: String,
      enum: [
        'air_conditioning',
        'artificial_lighting',
        'appliance_power',
        'central_hot_water',
        'internal_transport',
        'on_site_renewable_energy',
        'on_site_electric_vehicle',
        'on_site_battery_systems',
        'ancillary_plant'
      ],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    partNumber: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    manufacturer: {
      type: String,
      trim: true
    },
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    status: {
      type: String,
      enum: ['not_exist', 'pending', 'installed', 'maintenance', 'decommissioned'],
      default: 'not_exist'
    }
  }],
  energyMonitoring: [{
    systemType: {
      type: String,
      enum: [
        'authority_meter',
        'smart_meter',
        'memory_meter',
        'general_meter',
        'networking_equipment',
        'cloud',
        'on_premise'
      ],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    partNumber: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    manufacturer: {
      type: String,
      trim: true
    },
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    status: {
      type: String,
      enum: ['not_exist', 'pending', 'active', 'maintenance', 'decommissioned'],
      default: 'not_exist'
    },
    connectedLoads: [{
      type: mongoose.Schema.Types.ObjectId
    }]
  }],
  complianceStatus: {
    type: String,
    enum: ['pending', 'compliant', 'non_compliant'],
    default: 'pending'
  },
  lastAssessmentDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes
electricalSchema.index({ 'loads.partNumber': 1 });
electricalSchema.index({ 'energyMonitoring.partNumber': 1 });

module.exports = electricalSchema; 