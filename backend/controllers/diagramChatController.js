const OpenAI = require('openai');
const Project = require('../models/Project');
const { getSystemMessage } = require('../config/openaiMessages');
const axios = require('axios');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.chatWithAI = async (req, res) => {
  try {
    const { projectId, message, history } = req.body;
    if (!projectId || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

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

    // Log what we receive from OpenAI
    console.log('OpenAI Response (Diagram Chat):', completion.choices[0].message.content);

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: 'Error processing chat request', error: error.message });
  }
}; 