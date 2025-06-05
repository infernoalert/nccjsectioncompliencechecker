const mongoose = require('mongoose');

const analysisResultsSchema = new mongoose.Schema({
  hasAirConditioning: {
    type: Boolean
  },
  lastAnalyzed: {
    type: Date
  },
  rawAnalysis: {
    type: Object  // Store raw LLM response
  }
});

module.exports = analysisResultsSchema; 