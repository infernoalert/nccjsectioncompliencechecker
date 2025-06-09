const mongoose = require('mongoose');
const { embeddedSchema: solarAbsorptanceSchema } = require('./SolarAbsorptance');

const roofSchema = new mongoose.Schema({
  rValueByZone: {
    type: Map,
    of: Number,
    required: false,
    default: new Map([
      ['zone1', 0],
      ['zone2', 0],
      ['zone3', 0],
      ['zone4', 0],
      ['zone5', 0],
      ['zone6', 0],
      ['zone7', 0],
      ['zone8', 0]
    ])
  },
  solarAbsorptance: {
    type: solarAbsorptanceSchema,
    required: true
  }
}, { _id: false });

module.exports = {
  embeddedSchema: roofSchema,
  schema: new mongoose.Schema(roofSchema),
  model: mongoose.model('Roof', roofSchema)
}; 