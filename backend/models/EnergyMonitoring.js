const mongoose = require('mongoose');

const energyMonitoringSchema = new mongoose.Schema({
  systemType: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  partNumber: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  manufacturer: {
    type: String
  },
  specifications: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  connectedLoads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Load'
  }]
}, { _id: false });

module.exports = {
  embeddedSchema: energyMonitoringSchema,
  schema: new mongoose.Schema(energyMonitoringSchema),
  model: mongoose.model('EnergyMonitoring', energyMonitoringSchema)
}; 