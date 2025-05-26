const OpenAI = require('openai');
const Project = require('../models/Project');
const Conversation = require('../models/Conversation');
const { STEPS, STEP_TRANSITIONS, STEP_REQUIREMENTS } = require('../config/steps');
const { getInitialConfig } = require('../config/initialConfig');
const { getBOMConfig } = require('../config/bomConfig');
const { getDesignConfig } = require('../config/designConfig');
const { getReviewConfig } = require('../config/reviewConfig');
const { getFinalConfig } = require('../config/finalConfig');
const axios = require('axios');

// Debug logging
console.log('OpenAI API Key available:', !!process.env.OPENAI_API_KEY);
console.log('Current NODE_ENV:', process.env.NODE_ENV);

if (!process.env.OPENAI_API_KEY) {
  console.error('WARNING: OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getStepConfig = (step, project, existingDiagram) => {
  switch (step) {
    case STEPS.INITIAL:
      return getInitialConfig(project);
    case STEPS.BOM:
      return getBOMConfig(project);
    case STEPS.DESIGN:
      return getDesignConfig(project, existingDiagram);
    case STEPS.REVIEW:
      return getReviewConfig(project, existingDiagram);
    case STEPS.FINAL:
      return getFinalConfig(project, existingDiagram);
    default:
      return getInitialConfig(project);
  }
};

const extractStepData = (aiResponse, currentStep) => {
  try {
    // Look for structured data in the response
    const dataMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
    if (!dataMatch) return null;

    const extractedData = JSON.parse(dataMatch[1]);
    
    // Validate the extracted data
    const { validateStepRequirements } = require('../config/stepRequirements');
    const validation = validateStepRequirements(currentStep, extractedData);
    
    return validation.valid ? extractedData : null;
  } catch (error) {
    console.error('Error extracting step data:', error);
    return null;
  }
};

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with AI about diagram design
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - message
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: ID of the project
 *               message:
 *                 type: string
 *                 description: User's message to the AI
 *               history:
 *                 type: array
 *                 description: Previous conversation history
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     ai:
 *                       type: string
 *               currentStep:
 *                 type: string
 *                 enum: [initial, bom, design, review, final]
 *                 description: Current design step
 *     responses:
 *       200:
 *         description: AI response with conversation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                 conversationId:
 *                   type: string
 *                 currentStep:
 *                   type: string
 *                 isComplete:
 *                   type: boolean
 *                 nextSteps:
 *                   type: array
 *                   items:
 *                     type: string
 */
exports.chatWithAI = async (req, res) => {
  try {
    const { projectId, message, history, currentStep = STEPS.INITIAL } = req.body;
    
    // Validate request
    if (!projectId || !message) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          projectId: !projectId ? 'Project ID is required' : null,
          message: !message ? 'Message is required' : null
        }
      });
    }

    console.log('Received chat request:', { projectId, message, history, currentStep });

    // Get project details
    const project = await Project.findById(projectId);
    if (!project) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find or create a conversation for this project
    let conversation = await Conversation.findOne({ project: projectId });
    if (!conversation) {
      conversation = new Conversation({
        project: projectId,
        currentStep,
        conversationHistory: []
      });
    }

    // Get existing diagram if available
    let existingDiagram = null;
    try {
      const diagramResponse = await axios.get(`/api/projects/${projectId}/diagram`, {
        headers: {
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`,
          'Content-Type': 'application/json'
        }
      });
      existingDiagram = diagramResponse.data.data;
    } catch (error) {
      console.log('No existing diagram found or error fetching diagram:', error.message);
    }

    // Get step-specific configuration
    const stepConfig = getStepConfig(currentStep, project, existingDiagram);
    
    // Add instruction for structured data format
    const systemMessage = `${stepConfig.role}\n${stepConfig.context}\n${stepConfig.instructions}\n\nPlease provide your response in the following format:\n1. Your detailed response\n2. A JSON block with the required data for this step:\n\`\`\`json\n{\n  // Required fields for ${currentStep} step\n}\n\`\`\``;

    // Format conversation history if provided
    let userPrompt = '';
    if (Array.isArray(history) && history.length > 0) {
      userPrompt = history.slice(-2).map((conv, i) =>
        `Previous Conversation ${i+1} (most recent last):\nUser: ${conv.user}\nAI: ${conv.ai}`
      ).join('\n\n');
      userPrompt += `\n\nCurrent User Request: ${message}`;
    } else {
      userPrompt = message;
    }

    // Log what we send to OpenAI
    console.log('OpenAI Request:', { 
      currentStep,
      systemMessageLength: systemMessage.length,
      userPromptLength: userPrompt.length
    });

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      model: "gpt-3.5-turbo",
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Extract structured data from AI response
    const stepData = extractStepData(aiResponse, currentStep);
    
    // Add the new conversation to history
    conversation.conversationHistory.push({
      user: message,
      ai: aiResponse
    });

    // If we got valid step data, update the conversation
    if (stepData) {
      conversation.stepData = {
        ...conversation.stepData,
        ...stepData
      };
      
      // Auto-validate the step if we got valid data
      conversation.validateCurrentStep(stepData);
    }

    // Save the conversation
    await conversation.save();

    // Log what we receive from OpenAI
    console.log('OpenAI Response:', {
      currentStep,
      responseLength: aiResponse.length
    });

    // Get available next steps
    const nextSteps = STEP_TRANSITIONS[currentStep] || [];

    res.json({
      response: aiResponse,
      conversationId: conversation._id,
      currentStep: conversation.currentStep,
      isComplete: conversation.isComplete,
      nextSteps,
      stepRequirements: STEP_REQUIREMENTS[currentStep],
      extractedData: stepData // Include the extracted data in response
    });
  } catch (error) {
    console.error('Chat error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    // Handle specific error types
    if (error.response?.status === 401) {
      return res.status(401).json({ message: 'Invalid OpenAI API key' });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ message: 'OpenAI API rate limit exceeded' });
    }

    res.status(500).json({ 
      message: 'Error processing chat request', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * @swagger
 * /api/chat/step:
 *   put:
 *     summary: Update conversation step
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - newStep
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation
 *               newStep:
 *                 type: string
 *                 enum: [initial, bom, design, review, final]
 *                 description: New step to set
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
 *                 currentStep:
 *                   type: string
 *                 nextSteps:
 *                   type: array
 *                   items:
 *                     type: string
 */
exports.updateStep = async (req, res) => {
  try {
    const { conversationId, newStep } = req.body;

    if (!conversationId || !newStep) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          conversationId: !conversationId ? 'Conversation ID is required' : null,
          newStep: !newStep ? 'New step is required' : null
        }
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Validate step transition
    const validSteps = Object.values(STEPS);
    if (!validSteps.includes(newStep)) {
      return res.status(400).json({ 
        message: 'Invalid step',
        details: {
          validSteps,
          providedStep: newStep
        }
      });
    }

    // Check if transition is allowed
    const allowedTransitions = STEP_TRANSITIONS[conversation.currentStep] || [];
    if (!allowedTransitions.includes(newStep)) {
      return res.status(400).json({
        message: 'Invalid step transition',
        details: {
          currentStep: conversation.currentStep,
          requestedStep: newStep,
          allowedTransitions
        }
      });
    }

    // Check if current step is validated and confirmed
    if (!conversation.canTransitionToNextStep()) {
      return res.status(400).json({
        message: 'Current step must be validated and confirmed before transition',
        details: {
          validation: conversation.stepValidation.get(conversation.currentStep),
          confirmation: conversation.stepConfirmation.get(conversation.currentStep)
        }
      });
    }

    // Update step
    conversation.currentStep = newStep;
    await conversation.save();

    // Get available next steps
    const nextSteps = STEP_TRANSITIONS[newStep] || [];

    res.json({
      message: 'Step updated successfully',
      currentStep: conversation.currentStep,
      nextSteps,
      stepRequirements: STEP_REQUIREMENTS[newStep]
    });
  } catch (error) {
    console.error('Step update error:', error);
    res.status(500).json({
      message: 'Error updating step',
      error: error.message
    });
  }
};

// NCC Section J only system message
const getNccSystemMessage = (project) => `
You are an expert in NCC Section J compliance. Only answer questions about NCC Section J requirements, compliance, and explanations for the user's project. Do NOT generate or suggest diagram commands or layouts.Do not answer questions not related to NCC.
Project details:
- Building Type: ${project.buildingType}
- Classification: ${project.buildingClassification?.classType || 'Not specified'}
- Location: ${project.location}
- Floor Area: ${project.floorArea} m²
`;

/**
 * @swagger
 * /api/chat/ncc:
 *   post:
 *     summary: NCC Section J Q&A Chat (NO diagram commands)
 *     description: |
 *       Sends a natural language message and project context to the AI, which responds ONLY with NCC Section J compliance answers. This endpoint does NOT generate or suggest diagram commands or layouts.
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: The project ID to provide context for the AI.
 *               message:
 *                 type: string
 *                 description: The user's natural language request.
 *               history:
 *                 type: array
 *                 description: Previous user/AI exchanges for context (optional).
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     ai:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response with NCC Section J compliance answer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: The AI's response (NCC Section J only).
 *       400:
 *         description: Missing required fields or bad request.
 *       401:
 *         description: Unauthorized (missing or invalid token).
 *       500:
 *         description: Server error or OpenAI error.
 */
exports.nccSectionJChat = async (req, res) => {
  try {
    const { projectId, message, history } = req.body;
    if (!projectId || !message) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          projectId: !projectId ? 'Project ID is required' : null,
          message: !message ? 'Message is required' : null
        }
      });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const systemMessage = getNccSystemMessage(project);
    let userPrompt = '';
    if (Array.isArray(history) && history.length > 0) {
      userPrompt = history.slice(-2).map((conv, i) =>
        `Previous Conversation ${i+1} (most recent last):\nUser: ${conv.user}\nAI: ${conv.ai}`
      ).join('\n\n');
      userPrompt += `\n\nCurrent User Request: ${message}`;
    } else {
      userPrompt = message;
    }
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      model: "gpt-3.5-turbo",
    });
    res.json({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error processing NCC Section J chat request', 
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/chat/validate:
 *   post:
 *     summary: Validate current step data
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - validationData
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation
 *               validationData:
 *                 type: object
 *                 description: Data to validate for current step
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 */
exports.validateStep = async (req, res) => {
  try {
    const { conversationId, validationData } = req.body;

    if (!conversationId || !validationData) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          conversationId: !conversationId ? 'Conversation ID is required' : null,
          validationData: !validationData ? 'Validation data is required' : null
        }
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const validation = conversation.validateCurrentStep(validationData);
    await conversation.save();

    res.json(validation);
  } catch (error) {
    console.error('Step validation error:', error);
    res.status(500).json({
      message: 'Error validating step',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/chat/confirm:
 *   post:
 *     summary: Confirm step transition
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - notes
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation
 *               notes:
 *                 type: string
 *                 description: Optional notes about the confirmation
 *     responses:
 *       200:
 *         description: Confirmation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 confirmed:
 *                   type: boolean
 *                 currentStep:
 *                   type: string
 */
exports.confirmStep = async (req, res) => {
  try {
    const { conversationId, notes } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          conversationId: 'Conversation ID is required'
        }
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.confirmStepTransition(req.user.id, notes);
    await conversation.save();

    res.json({
      confirmed: true,
      currentStep: conversation.currentStep
    });
  } catch (error) {
    console.error('Step confirmation error:', error);
    res.status(500).json({
      message: 'Error confirming step',
      error: error.message
    });
  }
}; 
