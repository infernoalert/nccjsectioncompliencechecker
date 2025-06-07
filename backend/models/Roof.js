const mongoose = require('mongoose');
const { embeddedSchema: solarAbsorptanceSchema } = require('./SolarAbsorptance');

const roofSchema = new mongoose.Schema({
  rValueByZone: {
    type: Map,
    of: Number,
    required: true
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