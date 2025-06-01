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
  console.log('\n=== Chat Request Processing ===');
  console.log('Project ID:', req.params.projectId);
  console.log('Step:', req.params.stepNumber);
  console.log('User Message:', req.body.message);

  try {
    // Validate request
    if (!req.params.projectId || !req.params.stepNumber || !req.body.message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get project and conversation
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    console.log('Project:', project.name);

    let conversation = await Conversation.findOne({ project: req.params.projectId });
    if (!conversation) {
      conversation = new Conversation({ project: req.params.projectId });
    }
    console.log('Conversation:', conversation ? 'Found' : 'Created new');

    // Add user message
    const userMessage = {
      role: 'user',
      content: req.body.message,
      timestamp: new Date(),
      step: req.params.stepNumber
    };
    conversation.messages.push(userMessage);
    console.log('Added user message');

    // Get AI response
    console.log('\n=== AI Processing ===');
    const aiResponse = await assistantManager.sendMessage(
      req.user._id,
      req.body.message,
      req.params.stepNumber,
      req.params.projectId
    );
    console.log('AI Response received');

    // Process step data
    let stepData = conversation.stepData.get(req.params.stepNumber) || {};
    console.log('\n=== Step Data Processing ===');
    
    if (req.params.stepNumber === 'initial') {
      console.log('Processing initial step data');
      const normalizedData = normalizeResponse(aiResponse, stepData);
      stepData = { ...stepData, ...normalizedData.arguments };
    } else if (req.params.stepNumber === 'bom') {
      console.log('Processing BOM step data');
      const initialRequirements = project.stepRequirements?.get('initial') || {};
      stepData = {
        buildingClassification: initialRequirements.buildingClassification,
        buildingServices: initialRequirements.buildingServices,
        ancillaryPlants: initialRequirements.ancillaryPlants || [],
        sharedAreasCount: initialRequirements.sharedAreasCount
      };
    }
    console.log('Step data processed');

    // Update conversation
    conversation.stepData.set(req.params.stepNumber, stepData);
    const aiMessage = {
      role: 'ai',
      content: aiResponse.message,
      timestamp: new Date(),
      step: req.params.stepNumber
    };
    conversation.messages.push(aiMessage);
    await conversation.save();
    console.log('Conversation updated and saved');

    // Send response
    console.log('\n=== Sending Response ===');
    res.json({
      message: aiResponse.message,
      stepData,
      currentStep: req.params.stepNumber
    });
    console.log('=== Chat Request Complete ===\n');

  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({ message: 'Internal server error' });
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