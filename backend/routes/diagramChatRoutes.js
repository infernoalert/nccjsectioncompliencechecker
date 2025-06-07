const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chatWithAI, updateConversationStep } = require('../controllers/diagramChatController');

/**
 * @swagger
 * /api/projects/{projectId}/chat/{stepNumber}:
 *   post:
 *     summary: Chat with AI assistant for a specific project step
 *     tags: [AI Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Step number or identifier
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
 *                 description: The message to send to the AI assistant
 *     responses:
 *       200:
 *         description: Chat response received successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: AI assistant's response
 *                 stepData:
 *                   type: object
 *                   description: Any step-specific data
 *                 conversationId:
 *                   type: string
 *                   description: ID of the conversation
 *                 currentStep:
 *                   type: string
 *                   description: Current step identifier
 *                 threadId:
 *                   type: string
 *                   description: Assistant thread ID
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */

// Chat routes
router.post('/:projectId/chat/:stepNumber', protect, chatWithAI);
router.put('/conversations/:conversationId/step', protect, updateConversationStep);

module.exports = router; 