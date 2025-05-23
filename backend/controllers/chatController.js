const OpenAI = require('openai');
const Project = require('../models/Project');
const { getSystemMessage } = require('../config/openaiMessages');
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

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with the AI to generate EMS diagram commands (TEMPORARY TEST ENDPOINT)
 *     description: |
 *       Sends a natural language message and project context to the AI, which responds with diagram commands and explanations. This endpoint is for testing and will be removed in production.
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
 *         description: AI response with commands and/or explanations.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: The AI's response (may include commands in curly braces).
 *       400:
 *         description: Missing required fields or bad request.
 *       401:
 *         description: Unauthorized (missing or invalid token).
 *       500:
 *         description: Server error or OpenAI error.
 */
exports.chatWithAI = async (req, res) => {
  try {
    const { projectId, message, history } = req.body;
    
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

    console.log('Received chat request:', { projectId, message, history });

    // Get project details
    const project = await Project.findById(projectId);
    if (!project) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('Project found:', {
      id: project._id,
      buildingType: project.buildingType,
      buildingClassification: project.buildingClassification?.classType || 'Not specified',
      location: project.location,
      floorArea: `${project.floorArea} m²`
    });

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

    // Create system message with project context and diagram instructions
    const systemMessage = getSystemMessage(project, existingDiagram);

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

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      model: "gpt-3.5-turbo",
    });

    console.log('OpenAI response received successfully');
    res.json({
      response: completion.choices[0].message.content
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
