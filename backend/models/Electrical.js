const mongoose = require('mongoose');

// Base schema for electrical properties
const electricalBaseSchema = {
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
      ]
    },
    name: {
      type: String,
      trim: true
    },
    partNumber: {
      type: String,
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
      ]
    },
    name: {
      type: String,
      trim: true
    },
    partNumber: {
      type: String,
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
};

// Schema for embedded use (no required fields)
const embeddedElectricalSchema = new mongoose.Schema(electricalBaseSchema, { _id: false });

// Schema for standalone use (with required fields)
const standaloneElectricalSchema = new mongoose.Schema({
  ...electricalBaseSchema,
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
  }]
}, {
  timestamps: true
});

// Create indexes for standalone schema
standaloneElectricalSchema.index({ 'loads.partNumber': 1 });
standaloneElectricalSchema.index({ 'energyMonitoring.partNumber': 1 });

// Export both schemas and the model
module.exports = {
  embeddedSchema: embeddedElectricalSchema,
  schema: standaloneElectricalSchema,
  model: mongoose.model('Electrical', standaloneElectricalSchema)
}; 