const mongoose = require('mongoose');

const mcpHistorySchema = new mongoose.Schema({
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
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  error: {
    type: String
  }
});

module.exports = mcpHistorySchema; 