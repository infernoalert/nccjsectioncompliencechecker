const mongoose = require('mongoose');

const energyMonitoringSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: false
  }
}, { _id: false });

module.exports = {
  embeddedSchema: energyMonitoringSchema,
  schema: new mongoose.Schema(energyMonitoringSchema),
  model: mongoose.model('EnergyMonitoring', energyMonitoringSchema)
}; 