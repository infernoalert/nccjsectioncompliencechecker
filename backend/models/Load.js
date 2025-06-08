const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  powerRating: {
    type: Number,
    required: true,
    min: 0
  },
  voltage: {
    type: Number,
    required: true,
    min: 0
  },
  current: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

module.exports = {
  embeddedSchema: loadSchema,
  schema: new mongoose.Schema(loadSchema),
  model: mongoose.model('Load', loadSchema)
}; 