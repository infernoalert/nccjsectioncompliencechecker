const OpenAI = require('openai');
const Project = require('../models/Project');
const Conversation = require('../models/Conversation');
const { getSystemMessage } = require('../config/openaiMessages');
const axios = require('axios');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.chatWithAI = async (req, res) => {
  try {
    const { projectId, message, history, currentStep = 'initial' } = req.body;
    if (!projectId || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Find or create a conversation for this project
    let conversation = await Conversation.findOne({ project: projectId });
    if (!conversation) {
      conversation = new Conversation({
        project: projectId,
        currentStep,
        conversationHistory: []
      });
    }

    const systemMessage = getSystemMessage(project, null);
    let userPrompt = message;
    if (Array.isArray(history) && history.length > 0) {
      userPrompt = history.slice(-2).map((conv, i) =>
        `Previous Conversation ${i+1} (most recent last):\nUser: ${conv.user}\nAI: ${conv.ai}`
      ).join('\n\n') + `\n\nCurrent User Request: ${message}`;
    }

    // Log what we send to OpenAI
    console.log('OpenAI Request (Diagram Chat):', { systemMessage, userPrompt });

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      model: "gpt-3.5-turbo",
    });

    const aiResponse = completion.choices[0].message.content;

    // Add the new conversation to history
    conversation.conversationHistory.push({
      user: message,
      ai: aiResponse
    });

    // Save the conversation
    await conversation.save();

    // Log what we receive from OpenAI
    console.log('OpenAI Response (Diagram Chat):', aiResponse);

    res.json({ 
      response: aiResponse,
      conversationId: conversation._id,
      currentStep: conversation.currentStep,
      isComplete: conversation.isComplete
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