const mongoose = require('mongoose');

const stepDataSchema = new mongoose.Schema({
  // Billing is required for the initial step, default is false (not required)
  billing_required: {
    type: Boolean,
    default: false
  },
  market_connection: Boolean,
  ancillary_plants: [String],
  building_type: String,
  building_classification: String,
  components: [{
    name: String,
    quantity: Number,
    specifications: mongoose.Schema.Types.Mixed
  }],
  diagram: {
    nodes: [mongoose.Schema.Types.Mixed],
    connections: [mongoose.Schema.Types.Mixed]
  },
  compliance_check: {
    status: String,
    issues: [String],
    recommendations: [String]
  },
  implementation_plan: {
    steps: [String],
    timeline: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  currentStep: {
    type: String,
    enum: ['initial', 'bom', 'design', 'review', 'final'],
    default: 'initial'
  },
  stepData: {
    type: stepDataSchema,
    default: () => ({})
  },
  stepValidation: {
    type: Map,
    of: {
      isValid: Boolean,
      validatedAt: Date,
      validatedBy: String,
      errors: [String]
    },
    default: () => new Map()
  },
  stepConfirmation: {
    type: Map,
    of: {
      confirmed: Boolean,
      confirmedAt: Date,
      confirmedBy: String,
      notes: String
    },
    default: () => new Map()
  },
  conversationHistory: [{
    user: String,
    ai: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to update timestamps
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to validate current step
conversationSchema.methods.validateCurrentStep = async function(validationData) {
  const { validateStepRequirements } = require('../config/stepRequirements');
  const validation = await validateStepRequirements(this.currentStep, validationData);
  
  this.stepValidation.set(this.currentStep, {
    isValid: validation.valid,
    validatedAt: new Date(),
    validatedBy: 'system',
    errors: validation.errors
  });

  if (validation.valid) {
    // Update step data with validated data
    this.stepData = {
      ...this.stepData,
      ...validation.validatedData
    };
  }

  return validation;
};

// Method to confirm step transition
conversationSchema.methods.confirmStepTransition = function(userId, notes = '') {
  const validation = this.stepValidation.get(this.currentStep);
  
  if (!validation || !validation.isValid) {
    throw new Error('Step must be validated before confirmation');
  }

  this.stepConfirmation.set(this.currentStep, {
    confirmed: true,
    confirmedAt: new Date(),
    confirmedBy: userId,
    notes
  });

  return true;
};

// Method to check if step can be transitioned
conversationSchema.methods.canTransitionToNextStep = function() {
  const validation = this.stepValidation.get(this.currentStep);
  const confirmation = this.stepConfirmation.get(this.currentStep);

  return validation?.isValid && confirmation?.confirmed;
};

// Add a method to update billing_required only when a specific message from AI is received
conversationSchema.methods.updateBillingRequired = function(newValue) {
  // Only update if the value is explicitly provided by AI
  if (typeof newValue === 'boolean') {
    this.stepData.billing_required = newValue;
  }
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation; 