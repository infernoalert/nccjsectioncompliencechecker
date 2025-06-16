const mongoose = require('mongoose');
const { embeddedSchema: historySchema } = require('../History');
const { embeddedSchema: analysisResultsSchema } = require('../AnalysisResults');

const mcpSchema = new mongoose.Schema({
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  history: [{
    type: historySchema
  }],
  analysisResults: {
    type: analysisResultsSchema,
    required: false
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error', 'IDLE'],
    default: 'pending'
  }
}, { _id: false });

module.exports = {
  embeddedSchema: mcpSchema,
  schema: new mongoose.Schema(mcpSchema),
  model: mongoose.model('MCP', mcpSchema)
}; 