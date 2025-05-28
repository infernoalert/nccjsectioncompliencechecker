const Project = require('../models/Project');
const Conversation = require('../models/Conversation');
const assistantManager = require('../services/assistantManager');
const steps = require('../data/steps.json');

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
exports.chatWithAI = async (req, res) => {
  try {
    const { projectId, stepNumber } = req.params;
    const { message } = req.body;
    
    // Add proper user check
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user._id; // Changed from req.user.id to req.user._id
    
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
      // Update user's current step if needed
      if (conversation.currentStep !== stepNumber) {
        await assistantManager.updateUserStep(userId, stepNumber);
        conversation.currentStep = stepNumber;
      }

      // Send message to assistant
      const response = await assistantManager.sendMessage(userId, message);
      console.log('AI Response:', response.message); // Log the full AI response

      // Store AI message
      conversation.messages.push({
        step: stepNumber,
        role: 'ai',
        content: response.message,
        timestamp: new Date()
      });

      // Parse JSON block from AI response (if any)
      let backendUpdate = null;
      const jsonMatch = response.message.match(/```json([\s\S]*?)```/);
      console.log('JSON Match:', jsonMatch); // Log if JSON block was found
      
      if (jsonMatch) {
        try {
          backendUpdate = JSON.parse(jsonMatch[1]);
          console.log('Parsed JSON:', backendUpdate); // Log the parsed JSON
          // LOGGING: Before updating stepData
          const oldStepData = conversation.stepData.get(stepNumber) || {};
          console.log('--- Conversation Step Update ---');
          console.log('Project:', projectId, 'Step:', stepNumber);
          console.log('Existing Step Data:', JSON.stringify(oldStepData));
          console.log('Incoming Update:', JSON.stringify(backendUpdate));

          // Find the step definition and requirements
          const stepDef = steps.find(s => s.step === Number(stepNumber) || s.step === stepNumber);
          const stepRequirements = stepDef ? stepDef.fields : [];

          // Merge update with existing data
          const mergedStepData = { ...oldStepData, ...backendUpdate };

          // If backendUpdate is a function call format, apply it
          if (
            backendUpdate &&
            typeof backendUpdate === 'object' &&
            backendUpdate.name &&
            backendUpdate.arguments &&
            'value' in backendUpdate.arguments
          ) {
            mergedStepData[backendUpdate.name] = backendUpdate.arguments.value;
            delete mergedStepData.name;
            delete mergedStepData.arguments;
          }

          // Ensure all required fields are present
          stepRequirements.forEach(req => {
            if (!(req.id in mergedStepData)) {
              mergedStepData[req.id] = null; // or a sensible default
            }
          });

          // LOGGING: After merge
          console.log('Merged Step Data (to be saved):', JSON.stringify(mergedStepData));

          conversation.stepData.set(stepNumber, mergedStepData);
          // LOGGING: After update
          console.log('Saved Step Data:', JSON.stringify(conversation.stepData.get(stepNumber)));
        } catch (e) {
          console.error('Error parsing JSON from AI response:', e);
        }
      }

      // Also check for function calls
      const functionMatch = response.message.match(/```json\s*{\s*"name":\s*"billingRequired"[^}]*}\s*```/);
      console.log('Function Match:', functionMatch); // Log if function call was found
      
      if (functionMatch) {
        try {
          const functionCall = JSON.parse(functionMatch[0].replace(/```json\s*|\s*```/g, ''));
          console.log('Parsed Function Call:', functionCall); // Log the parsed function call
          if (functionCall.name === 'billingRequired' && typeof functionCall.arguments?.value === 'boolean') {
            conversation.stepData.set(stepNumber, { billing_required: functionCall.arguments.value });
          }
        } catch (e) {
          console.error('Error parsing function call:', e);
        }
      }

      conversation.updatedAt = new Date();
      await conversation.save();

      // Return only the user-facing part of the AI response (strip code blocks)
      const userFacing = response.message.replace(/```[\s\S]*?```/g, '').trim();
      
      res.json({
        response: userFacing,
        stepData: conversation.stepData.get(stepNumber) || {},
        conversationId: conversation._id,
        currentStep: conversation.currentStep,
        threadId: response.threadId
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