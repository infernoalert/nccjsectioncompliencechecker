const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  step: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'error', 'pending'],
    default: 'pending'
  },
  error: {
    type: String
  }
}, { _id: false });

module.exports = {
  embeddedSchema: historySchema,
  schema: new mongoose.Schema(historySchema),
  model: mongoose.model('History', historySchema)
}; 