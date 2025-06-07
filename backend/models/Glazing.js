const mongoose = require('mongoose');
const { embeddedSchema: externalGlazingSchema } = require('./ExternalGlazing');

const glazingSchema = new mongoose.Schema({
  external: {
    type: externalGlazingSchema,
    required: true
  }
}, { _id: false });

module.exports = {
  embeddedSchema: glazingSchema,
  schema: new mongoose.Schema(glazingSchema),
  model: mongoose.model('Glazing', glazingSchema)
}; 