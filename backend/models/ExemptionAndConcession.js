const mongoose = require('mongoose');

const exemptionAndConcessionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    enum: ['minorUseRule', 'heritageBuilding', 'farmBuildingShed', 'temporaryBuilding']
  },
  description: {
    type: String,
    required: true
  },
  applicableBuildingClasses: {
    type: String,
    required: true
  },
  conditions: {
    type: String,
    required: true
  },
  limitations: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
exemptionAndConcessionSchema.index({ _id: 1 });

module.exports = mongoose.model('ExemptionAndConcession', exemptionAndConcessionSchema); 