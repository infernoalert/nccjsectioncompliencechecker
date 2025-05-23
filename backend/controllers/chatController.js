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

exports.chatWithAI = async (req, res) => {
  try {
    const { projectId, message } = req.body;
    
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

    console.log('Received chat request:', { projectId, message });

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

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message }
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
