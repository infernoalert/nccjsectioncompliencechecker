const mongoose = require('mongoose');

const CompliancePathwaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  applicability: {
    type: String,
    required: [true, 'Please add applicability information']
  },
  verification: {
    type: String,
    required: [true, 'Please add verification method']
  },
  requirements: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
CompliancePathwaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
CompliancePathwaySchema.index({ name: 1 });

module.exports = mongoose.model('CompliancePathway', CompliancePathwaySchema); 