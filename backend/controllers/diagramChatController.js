const OpenAI = require('openai');
const Project = require('../models/Project');
const Conversation = require('../models/Conversation');
const { getStepConfig } = require('../utils/diagramchatapihelper');
const axios = require('axios');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/projects/:projectId/steps/:stepNumber/chat
exports.chatWithAI = async (req, res) => {
  try {
    const { projectId, stepNumber } = req.params;
    const { message } = req.body;
    if (!projectId || !stepNumber || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find project
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Find or create conversation
    let conversation = await Conversation.findOne({ project: projectId });
    if (!conversation) {
      conversation = new Conversation({
        project: projectId,
        messages: [],
        stepData: {},
        currentStep: stepNumber
      });
    }

    // Store user message
    conversation.messages.push({
      step: stepNumber,
      role: 'user',
      content: message
    });

    // Build prompt for AI
    const stepConfig = getStepConfig(stepNumber, project, null); // Pass diagram if needed
    const history = conversation.messages
      .filter(m => m.step === stepNumber)
      .map(m => ({ role: m.role, content: m.content }));
    const messages = [
      { role: 'system', content: stepConfig.role },
      ...history,
      { role: 'user', content: message }
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 2000
    });
    const aiResponse = completion.choices[0].message.content;

    // Store AI message
    conversation.messages.push({
      step: stepNumber,
      role: 'ai',
      content: aiResponse
    });

    // Parse backend JSON block from AI response (if any)
    let backendUpdate = null;
    const jsonMatch = aiResponse.match(/```json([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        backendUpdate = JSON.parse(jsonMatch[1]);
        // Update stepData for this step (support Map or plain object)
        if (conversation.stepData instanceof Map || (typeof conversation.stepData.set === 'function' && typeof conversation.stepData.get === 'function')) {
          conversation.stepData.set(stepNumber, backendUpdate);
        } else {
          conversation.stepData[stepNumber] = backendUpdate;
        }
      } catch (e) {
        // Ignore parse errors, just don't update stepData
      }
    }

    conversation.currentStep = stepNumber;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Return only the user-facing part of the AI response (strip code blocks)
    const userFacing = aiResponse.replace(/```[\s\S]*?```/g, '').trim();
    // Support Map or plain object for stepData
    let stepDataForStep;
    if (conversation.stepData instanceof Map || (typeof conversation.stepData.get === 'function')) {
      stepDataForStep = conversation.stepData.get(stepNumber) || {};
    } else {
      stepDataForStep = conversation.stepData[stepNumber] || {};
    }
    res.json({
      response: userFacing,
      stepData: stepDataForStep,
      conversationId: conversation._id,
      currentStep: conversation.currentStep
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing chat request', error: error.message });
  }
};

// Add new endpoint to update conversation step
exports.updateConversationStep = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { currentStep, isComplete } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (currentStep) conversation.currentStep = currentStep;
    if (typeof isComplete === 'boolean') conversation.isComplete = isComplete;

    await conversation.save();

    res.json({
      message: 'Conversation step updated successfully',
      conversation: {
        id: conversation._id,
        currentStep: conversation.currentStep,
        isComplete: conversation.isComplete
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating conversation step', error: error.message });
  }
};

// Diagram Chat Controller for step-based AI config and chat logic

module.exports = {
  chatWithAI: exports.chatWithAI,
  updateConversationStep: exports.updateConversationStep
}; 