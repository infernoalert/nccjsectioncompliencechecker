const mongoose = require('mongoose');

const analysisResultsSchema = new mongoose.Schema({
  hasAirConditioning: {
    type: Boolean,
    default: false
  },
  lastAnalyzed: {
    type: Date,
    default: Date.now
  },
  rawAnalysis: {
    type: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

module.exports = {
  embeddedSchema: analysisResultsSchema,
  schema: new mongoose.Schema(analysisResultsSchema),
  model: mongoose.model('AnalysisResults', analysisResultsSchema)
}; 