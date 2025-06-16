const OpenAI = require('openai');
const Project = require('../models/Project');
const DiagramService = require('../services/diagramService');
const assistantManager = require('../services/assistantManager');
const fs = require('fs').promises;
const path = require('path');

// Debug logging
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
  API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0
});

if (!process.env.OPENAI_API_KEY) {
  console.error('WARNING: OPENAI_API_KEY is not set in environment variables');
  throw new Error('OpenAI API key is required but not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to check if EMS is required based on floor area
const isEMSRequired = (floorArea) => {
  return floorArea >= 500; // EMS required for buildings >= 500 m²
};

// Function to load EMS template
const loadEMSTemplate = async () => {
  try {
    const templatePath = path.join(__dirname, '../data/templates/ems-template.json');
    const templateContent = await fs.readFile(templatePath, 'utf8');
    return JSON.parse(templateContent);
  } catch (error) {
    console.error('Error loading EMS template:', error);
    throw new Error('Failed to load EMS template');
  }
};

// Function to save diagram data
const saveDiagramData = async (projectId, diagramData) => {
  try {
    await DiagramService.saveDiagram(projectId, diagramData);
  } catch (error) {
    console.error('Error saving diagram data:', error);
    throw new Error('Failed to save diagram data');
  }
};

// Function to get step configuration
const getStepConfiguration = async (step, project, existingDiagram) => {
  try {
    const config = await getStepConfig(step, project, existingDiagram);
    return config;
  } catch (error) {
    console.error('Error getting step configuration:', error);
    throw error;
  }
};

// POST /api/projects/:projectId/interpret
exports.interpretChat = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, isGenericRequest = false } = req.body;
    const userId = req.user.id;

    console.log('Received interpret request:', {
      projectId,
      messageLength: message?.length,
      isGenericRequest
    });

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if EMS is required
    const emsRequired = isEMSRequired(project.floorArea);
    console.log('EMS requirement check:', { floorArea: project.floorArea, emsRequired });

    // Get existing diagram if any
    const existingDiagram = await DiagramService.getDiagram(projectId);
    console.log('Existing diagram:', existingDiagram ? 'Found' : 'Not found');

    // Skip step configuration since steps are removed

    if (isGenericRequest || emsRequired) {
      console.log('Using EMS template for generic/required request');
      try {
        const templateContent = await loadEMSTemplate();
        await saveDiagramData(projectId, templateContent);
        return res.json({
          nodes: templateContent.nodes,
          edges: templateContent.edges
        });
      } catch (templateError) {
        console.error('Error using template:', templateError);
        return res.status(500).json({
          error: 'Error generating diagram',
          details: templateError.message
        });
      }
    }

    try {
      // Send message to assistant
      const response = await assistantManager.sendMessage(userId, message);

      // Parse the response for diagram data
      let diagramData;
      try {
        const jsonMatch = response.message.match(/```json([\s\S]*?)```/);
        if (jsonMatch) {
          diagramData = JSON.parse(jsonMatch[1]);
        }
      } catch (parseError) {
        console.error('Error parsing diagram data:', parseError);
      }

      if (diagramData) {
        await saveDiagramData(projectId, diagramData);
        res.json({
          nodes: diagramData.nodes,
          edges: diagramData.edges
        });
      } else {
        // If no diagram data, return the assistant's response
        res.json({
          message: response.message.replace(/```[\s\S]*?```/g, '').trim()
        });
      }
    } catch (error) {
      console.error('Error in OpenAI request:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      console.log('Using EMS template as fallback due to OpenAI error');
      try {
        const templateContent = await loadEMSTemplate();
        await saveDiagramData(projectId, templateContent);
        res.json({
          nodes: templateContent.nodes,
          edges: templateContent.edges
        });
      } catch (templateError) {
        console.error('Error using template as fallback:', templateError);
        res.status(500).json({
          error: 'Error generating diagram',
          details: templateError.message
        });
      }
    }
  } catch (error) {
    console.error('Error in interpretChat:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Error interpreting chat',
      details: error.message
    });
  }
};

module.exports = {
  interpretChat: exports.interpretChat
}; 