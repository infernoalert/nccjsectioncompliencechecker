const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
  rValueByZone: {
    type: Map,
    of: Number,
    required: true
  }
}, { _id: false });

module.exports = {
  embeddedSchema: floorSchema,
  schema: new mongoose.Schema(floorSchema),
  model: mongoose.model('Floor', floorSchema)
}; 