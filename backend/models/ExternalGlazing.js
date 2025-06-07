const mongoose = require('mongoose');

const externalGlazingSchema = new mongoose.Schema({
  shgcByZone: {
    type: Map,
    of: Number,
    required: true
  },
  uValueByZone: {
    type: Map,
    of: Number,
    required: true
  }
}, { _id: false });

module.exports = {
  embeddedSchema: externalGlazingSchema,
  schema: new mongoose.Schema(externalGlazingSchema),
  model: mongoose.model('ExternalGlazing', externalGlazingSchema)
}; 