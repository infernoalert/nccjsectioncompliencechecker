const OpenAI = require('openai');
const Project = require('../models/Project');
const Conversation = require('../models/Conversation');
const { getStepConfig } = require('../utils/diagramchatapihelper');
const axios = require('axios');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Step mapping
const STEP_KEY_TO_NUMBER = {
  initial: 1,
  bom: 2,
  design: 3,
  review: 4,
  final: 5
};

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
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({ project: projectId });
    if (!conversation) {
      conversation = new Conversation({
        project: projectId,
        messages: [],
        stepData: new Map(),
        currentStep: stepNumber
      });
    }

    // Store user message
    conversation.messages.push({
      step: stepNumber,
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    try {
      // Build prompt for AI
      const stepConfig = getStepConfig(stepNumber, project, null);
      const history = conversation.messages
        .filter(m => m.step === stepNumber)
        .map(m => ({ 
          role: m.role === 'ai' ? 'assistant' : m.role, 
          content: m.content 
        }));
      
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
        role: 'ai', // Keep as 'ai' in our database
        content: aiResponse,
        timestamp: new Date()
      });

      // Parse backend JSON block from AI response (if any)
      let backendUpdate = null;
      const jsonMatch = aiResponse.match(/```json([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          backendUpdate = JSON.parse(jsonMatch[1]);
          conversation.stepData.set(stepNumber, backendUpdate);
        } catch (e) {
          console.error('Error parsing JSON from AI response:', e);
        }
      }

      conversation.currentStep = stepNumber;
      conversation.updatedAt = new Date();
      await conversation.save();

      // Return only the user-facing part of the AI response (strip code blocks)
      const userFacing = aiResponse.replace(/```[\s\S]*?```/g, '').trim();
      
      res.json({
        response: userFacing,
        stepData: conversation.stepData.get(stepNumber) || {},
        conversationId: conversation._id,
        currentStep: conversation.currentStep
      });
    } catch (error) {
      console.error('Error in OpenAI call or response processing:', error);
      res.status(500).json({ 
        message: 'Error processing AI response', 
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({ 
      message: 'Error processing chat request', 
      error: error.message 
    });
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
    console.error('Error in updateConversationStep:', error);
    res.status(500).json({ 
      message: 'Error updating conversation step', 
      error: error.message 
    });
  }
};

// Diagram Chat Controller for step-based AI config and chat logic

module.exports = {
  chatWithAI: exports.chatWithAI,
  updateConversationStep: exports.updateConversationStep
}; 