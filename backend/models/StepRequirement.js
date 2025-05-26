const mongoose = require('mongoose');

const stepRequirementSchema = new mongoose.Schema({
  step: {
    type: String,
    required: [true, 'Step name is required'],
    enum: ['initial', 'bom', 'design', 'review', 'final'],
    unique: true
  },
  requiredFields: [{
    id: {
      type: String,
      required: [true, 'Field ID is required']
    },
    type: {
      type: String,
      required: [true, 'Field type is required'],
      enum: ['boolean', 'string', 'number', 'array', 'object']
    },
    description: {
      type: String,
      required: [true, 'Field description is required']
    },
    validation: {
      type: String,
      required: [true, 'Validation function is required']
    }
  }],
  requirementMessage: {
    type: String,
    required: [true, 'Requirement message is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
stepRequirementSchema.index({ step: 1 });

module.exports = mongoose.model('StepRequirement', stepRequirementSchema); 