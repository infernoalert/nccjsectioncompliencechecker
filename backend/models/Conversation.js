const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  step: { type: String, required: true }, // e.g., 'initial', 'bom', etc.
  role: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  messages: [MessageSchema],
  stepData: { type: Map, of: Object }, // stepName -> data object
  currentStep: { type: String, default: 'initial' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', ConversationSchema); 