const express = require('express');
const router = express.Router();
const diagramChatController = require('../controllers/diagramChatController');

/**
 * @swagger
 * /api/conversations/chat:
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
 *                 enum: [initial, design, review, final]
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
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.post('/chat', diagramChatController.chatWithAI);

/**
 * @swagger
 * /api/conversations/{conversationId}/step:
 *   put:
 *     summary: Update conversation step and completion status
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentStep:
 *                 type: string
 *                 enum: [initial, design, review, final]
 *                 description: New step to set
 *               isComplete:
 *                 type: boolean
 *                 description: Whether the current step is complete
 *     responses:
 *       200:
 *         description: Conversation step updated successfully
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
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.put('/:conversationId/step', diagramChatController.updateConversationStep);

module.exports = router; 