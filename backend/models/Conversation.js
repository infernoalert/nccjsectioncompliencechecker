const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  conversationHistory: [{
    user: {
      type: String,
      required: true
    },
    ai: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  currentStep: {
    type: String,
    required: true,
    enum: ['initial', 'design', 'review', 'final'], // Add more steps as needed
    default: 'initial'
  },
  isComplete: {
    type: Boolean,
    default: false
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
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation; 