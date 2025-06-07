const mongoose = require('mongoose');
const { embeddedSchema: thermalBreaksSchema } = require('./ThermalBreaks');

const externalWallSchema = new mongoose.Schema({
  rValueByZone: {
    type: Map,
    of: Number,
    required: true
  },
  thermalBreaks: {
    type: thermalBreaksSchema,
    required: true
  }
}, { _id: false });

module.exports = {
  embeddedSchema: externalWallSchema,
  schema: new mongoose.Schema(externalWallSchema),
  model: mongoose.model('ExternalWall', externalWallSchema)
}; 