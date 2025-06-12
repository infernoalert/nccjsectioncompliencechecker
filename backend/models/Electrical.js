const mongoose = require('mongoose');
const { embeddedSchema: loadSchema } = require('./Load');
const { embeddedSchema: energyMonitoringSchema } = require('./EnergyMonitoring');

const electricalSchema = new mongoose.Schema({
  loads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Load'
  }],
  energyMonitoring: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnergyMonitoring'
  }],
  complianceStatus: {
    type: String,
    enum: ['pending', 'compliant', 'non_compliant'],
    default: 'pending'
  },
  lastAssessmentDate: {
    type: Date
  }
}, { _id: false });

module.exports = {
  embeddedSchema: electricalSchema,
  schema: new mongoose.Schema(electricalSchema)
}; 