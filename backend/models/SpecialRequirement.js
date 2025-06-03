const mongoose = require('mongoose');

// Base schema for special requirement properties
const specialRequirementBaseSchema = {
  trigger: {
    type: String
  },
  requirements: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  conditions: {
    type: [String],
    default: []
  },
  exemptions: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
};

// Schema for embedded use (no required fields)
const embeddedSpecialRequirementSchema = new mongoose.Schema(specialRequirementBaseSchema, { _id: false });

// Schema for standalone use (with additional fields)
const standaloneSpecialRequirementSchema = new mongoose.Schema({
  ...specialRequirementBaseSchema,
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
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
standaloneSpecialRequirementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
standaloneSpecialRequirementSchema.index({ _id: 1 });

// Export both schemas and the model
module.exports = {
  embeddedSchema: embeddedSpecialRequirementSchema,
  schema: standaloneSpecialRequirementSchema,
  model: mongoose.model('SpecialRequirement', standaloneSpecialRequirementSchema)
}; 