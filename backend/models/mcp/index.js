const mongoose = require('mongoose');
const mcpHistorySchema = require('./historySchema');
const analysisResultsSchema = require('./analysisResultsSchema');

const mcpSchema = new mongoose.Schema({
  currentStep: {
    type: String,
    enum: ['FILE_UPLOAD', 'TEXT_EXTRACTION', 'INITIAL_ANALYSIS', 'PROJECT_UPDATE', 'NEXT_ANALYSIS'],
    default: 'FILE_UPLOAD'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  history: [mcpHistorySchema],
  analysisResults: {
    type: analysisResultsSchema,
    default: () => ({})
  },
  processingStatus: {
    type: String,
    enum: ['IDLE', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'IDLE'
  }
});

// Export both the model and the embedded schema
module.exports = {
  model: mongoose.model('MCP', mcpSchema),
  embeddedSchema: mcpSchema
}; 