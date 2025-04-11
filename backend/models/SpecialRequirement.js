const mongoose = require('mongoose');

const SpecialRequirementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  trigger: {
    type: String,
    required: [true, 'Please add a trigger condition']
  },
  requirements: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  conditions: {
    type: [String],
    default: []
  },
  exemptions: {
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
SpecialRequirementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
SpecialRequirementSchema.index({ _id: 1 });

module.exports = mongoose.model('SpecialRequirement', SpecialRequirementSchema); 