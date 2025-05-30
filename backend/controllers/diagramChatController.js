const Project = require('../models/Project');
const Conversation = require('../models/Conversation');
const assistantManager = require('../services/assistantManager');
const steps = require('../data/steps.json');
const { normalizeResponse } = require('../utils/responseNormalizer');

/**
 * @swagger
 * /api/projects/{projectId}/steps/{stepNumber}/chat:
 *   post:
 *     summary: Chat with the AI assistant for a specific project step
 *     description: |
 *       Sends a message to the AI assistant for the current project step.
 *       Uses the user's existing thread or creates a new one if needed.
 *       The assistant is selected based on the current step (initial, bom, design, review, final).
 *     tags:
 *       - AI Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: string
 *           enum: [initial, bom, design, review, final]
 *         description: The current step in the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's message to the AI assistant
 *     responses:
 *       200:
 *         description: AI response with message and step data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: The AI's response message
 *                 stepData:
 *                   type: object
 *                   description: Any step-specific data returned by the AI
 *                 conversationId:
 *                   type: string
 *                   description: The conversation ID
 *                 currentStep:
 *                   type: string
 *                   description: The current step
 *                 threadId:
 *                   type: string
 *                   description: The OpenAI thread ID
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */

// Add this function before chatWithAI
async function getAIResponse(conversation, step, userId) {
  console.log('\n=== Getting AI Response ===');
  console.log('Conversation:', conversation._id);
  console.log('Step:', step);
  console.log('User ID:', userId);

  try {
    // Get or create thread for this conversation
    let threadId = conversation.threadId;
    if (!threadId) {
      console.log('Creating new thread for conversation');
      threadId = await assistantManager.getOrCreateThread(userId);
      conversation.threadId = threadId;
      await conversation.save();
    }

    // Send message to assistant
    const response = await assistantManager.sendMessage(userId, lastMessage.content);
    console.log('Assistant response received');

    return response.message;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}

exports.chatWithAI = async (req, res) => {
  console.log('\n=== New Chat Request ===');
  console.log('Request Params:', req.params);
  console.log('Request Body:', req.body);

  try {
    // Authentication check
    if (!req.user) {
      console.log('Authentication Error: No user found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user._id;
    console.log('Authenticated User ID:', userId);

    // Validate request
    const { projectId, stepNumber } = req.params;
    const { message, step } = req.body;

    // Use step from body or params
    const currentStep = step || stepNumber;

    if (!projectId || !message || !currentStep) {
      console.log('Validation Error: Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { projectId, message, step: currentStep }
      });
    }

    // Get project
    const project = await Project.findById(projectId);
    if (!project) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }
    console.log('Found project:', project.name);

    // Get or create conversation
    let conversation = await Conversation.findOne({ project: projectId });
    if (!conversation) {
      console.log('Creating new conversation for project');
      conversation = new Conversation({
        project: projectId,
        messages: [],
        stepData: {},
        currentStep: currentStep
      });
    } else {
      console.log('Found existing conversation');
      console.log('Current step data:', JSON.stringify(conversation.stepData.get(currentStep), null, 2));
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      step: currentStep
    };
    conversation.messages.push(userMessage);
    console.log('Added user message:', userMessage);

    // Build project info string
    const projectInfo = `Project Info:\n- Name: ${project.name}\n- Building Type: ${project.buildingType}\n- Classification: ${project.buildingClassification}\n- Floor Area: ${project.floorArea}\n`;
    // Prepend project info to the user message for the AI
    const aiInput = `${projectInfo}\nUser: ${message}`;

    // Get AI response
    console.log('\n=== Getting AI Response ===');
    const aiResult = await assistantManager.sendMessage(userId, aiInput);
    console.log('Raw AI Response:', aiResult);
    const aiResponse = aiResult.message; // Extract the string

    // Process AI response
    console.log('\n=== Processing AI Response ===');
    let stepData = conversation.stepData.get(currentStep) || {};
    console.log('Current step data:', JSON.stringify(stepData, null, 2));

    // Always send the full AI response text to the normalizer, ignore JSON parsing
    console.log('Normalizing AI response from text');
    const normalizedData = normalizeResponse(aiResponse, stepData);
    console.log('Normalized data:', JSON.stringify(normalizedData, null, 2));
    stepData = { ...stepData, ...normalizedData.arguments };

    // Update step data
    conversation.stepData.set(currentStep, stepData);
    console.log('Updated step data:', JSON.stringify(stepData, null, 2));

    // Add AI message (keeping the original response text)
    const aiMessage = {
      role: 'ai',
      content: aiResponse,
      timestamp: new Date(),
      step: currentStep
    };
    conversation.messages.push(aiMessage);
    console.log('Added AI message:', aiMessage);

    // Save conversation
    await conversation.save();
    console.log('Saved conversation with updated step data');

    // Send response
    const response = {
      message: aiResponse,
      stepData: stepData,
      currentStep: currentStep
    };
    console.log('\n=== Sending Response ===');
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== Chat Request Complete ===\n');

    res.json(response);
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/conversations/{conversationId}/step:
 *   put:
 *     summary: Update the current step of a conversation
 *     description: |
 *       Updates the current step of a conversation and switches to the appropriate AI assistant.
 *       This will update both the conversation and the user's assistant thread.
 *     tags:
 *       - AI Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentStep:
 *                 type: string
 *                 enum: [initial, bom, design, review, final]
 *                 description: The new step to set
 *               isComplete:
 *                 type: boolean
 *                 description: Whether the current step is complete
 *     responses:
 *       200:
 *         description: Step updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     currentStep:
 *                       type: string
 *                     isComplete:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
exports.updateConversationStep = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { currentStep, isComplete } = req.body;
    
    // Add proper user check
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user._id; // Changed from req.user.id to req.user._id

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (currentStep) {
      await assistantManager.updateUserStep(userId, currentStep);
      conversation.currentStep = currentStep;
    }
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

module.exports = {
  chatWithAI: exports.chatWithAI,
  updateConversationStep: exports.updateConversationStep
}; 