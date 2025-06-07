const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  partNumber: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  manufacturer: {
    type: String
  },
  specifications: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, { _id: false });

module.exports = {
  embeddedSchema: loadSchema,
  schema: new mongoose.Schema(loadSchema),
  model: mongoose.model('Load', loadSchema)
}; 