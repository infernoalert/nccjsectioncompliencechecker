const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  powerRating: {
    type: Number,
    min: 0
  },
  voltage: {
    type: Number,
    min: 0
  },
  current: {
    type: Number,
    min: 0
  }
});

module.exports = {
  embeddedSchema: loadSchema,
  schema: new mongoose.Schema(loadSchema),
  model: mongoose.model('Load', loadSchema)
}; 