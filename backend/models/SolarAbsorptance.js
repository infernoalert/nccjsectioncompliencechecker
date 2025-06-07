const mongoose = require('mongoose');

const solarAbsorptanceSchema = new mongoose.Schema({
  max: {
    type: Number,
    required: true
  },
  exemptZones: [{
    type: String
  }]
}, { _id: false });

module.exports = {
  embeddedSchema: solarAbsorptanceSchema,
  schema: new mongoose.Schema(solarAbsorptanceSchema),
  model: mongoose.model('SolarAbsorptance', solarAbsorptanceSchema)
}; 