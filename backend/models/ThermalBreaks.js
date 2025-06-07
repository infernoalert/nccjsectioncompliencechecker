const mongoose = require('mongoose');

const thermalBreaksSchema = new mongoose.Schema({
  metalFramed: {
    type: Boolean,
    required: true
  }
}, { _id: false });

module.exports = {
  embeddedSchema: thermalBreaksSchema,
  schema: new mongoose.Schema(thermalBreaksSchema),
  model: mongoose.model('ThermalBreaks', thermalBreaksSchema)
}; 