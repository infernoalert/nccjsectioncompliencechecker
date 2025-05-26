const OpenAI = require('openai');
const Project = require('../models/Project');
const DiagramService = require('../services/diagramService');
const { getInitialConfig } = require('../config/initialConfig');
const { getBOMConfig } = require('../config/bomConfig');
const { getDesignConfig } = require('../config/designConfig');
const { getReviewConfig } = require('../config/reviewConfig');
const { getFinalConfig } = require('../config/finalConfig');
const { STEPS } = require('../config/steps');
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
    const templatePath = path.join(__dirname, '../data/EMSTemplate.json');
    console.log('Loading template from:', templatePath);
    
    const templateData = await fs.readFile(templatePath, 'utf8');
    console.log('Template data loaded:', templateData.substring(0, 100) + '...');
    
    const parsedData = JSON.parse(templateData);
    console.log('Template parsed successfully:', {
      nodesCount: parsedData.nodes?.length || 0,
      edgesCount: parsedData.edges?.length || 0
    });
    
    // Ensure the response has the correct structure
    return {
      nodes: Array.isArray(parsedData.nodes) ? parsedData.nodes : [],
      edges: Array.isArray(parsedData.edges) ? parsedData.edges : []
    };
  } catch (error) {
    console.error('Error loading EMS template:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new Error(`Failed to load EMS template: ${error.message}`);
  }
};

// Function to save diagram data
const saveDiagramData = async (projectId, diagramData) => {
  try {
    console.log('Saving diagram data for project:', projectId);
    console.log('Data to save:', {
      nodesCount: diagramData.nodes?.length || 0,
      edgesCount: diagramData.edges?.length || 0
    });

    // Ensure the data has the correct structure before saving
    const dataToSave = {
      nodes: Array.isArray(diagramData.nodes) ? diagramData.nodes : [],
      edges: Array.isArray(diagramData.edges) ? diagramData.edges : []
    };

    await DiagramService.saveDiagram(projectId, dataToSave);
    console.log('Diagram data saved successfully');
  } catch (error) {
    console.error('Error saving diagram data:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new Error(`Failed to save diagram data: ${error.message}`);
  }
};

// Add a helper to select the config for the current step
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

// Step 1: Interpretation API - Convert chat to structured design plan
const interpretChat = async (req, res) => {
  try {
    const { projectId, message, chatHistory } = req.body;
    console.log('Received interpret-chat request:', { 
      projectId, 
      messageLength: message?.length || 0,
      chatHistoryLength: chatHistory?.length || 0
    });

    if (!projectId || !message) {
      console.error('Missing required fields:', { projectId, message });
      return res.status(400).json({ 
        error: 'Project ID and message are required',
        details: { projectId: !projectId, message: !message }
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingDiagram = await DiagramService.getDiagram(projectId);
    console.log('Existing diagram:', {
      exists: !!existingDiagram,
      nodesCount: existingDiagram?.nodes?.length || 0,
      edgesCount: existingDiagram?.edges?.length || 0
    });

    // Check if EMS is required based on floor area
    const emsRequired = isEMSRequired(project.floorArea);
    console.log('EMS required:', emsRequired, 'Floor area:', project.floorArea);

    // Check if this is a generic request
    const isGenericRequest = message.toLowerCase().includes('generic') || 
                           message.toLowerCase().includes('basic') || 
                           message.trim().length === 0;
    console.log('Request type:', { isGenericRequest, messageLength: message.length });

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
      const stepConfig = getStepConfig(currentStep, project, existingDiagram);
      console.log('System message length:', stepConfig.role.length);

      // Prepare messages array with chat history
      const messages = [
        { role: 'system', content: stepConfig.role },
        ...(chatHistory || []),
        { role: 'user', content: message }
      ];

      console.log('Sending request to OpenAI with messages:', {
        messageCount: messages.length,
        lastMessageLength: message.length
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      });

      console.log('OpenAI response received:', {
        hasContent: !!response.choices[0]?.message?.content,
        contentLength: response.choices[0]?.message?.content?.length || 0
      });

      const content = response.choices[0].message.content;
      console.log('Response content preview:', content.substring(0, 100) + '...');

      let parsedContent;
      try {
        // Try to extract JSON if there's any surrounding text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        parsedContent = JSON.parse(jsonMatch[0]);
        console.log('Parsed content:', {
          hasNodes: !!parsedContent.nodes,
          nodesCount: parsedContent.nodes?.length || 0,
          hasEdges: !!parsedContent.edges,
          edgesCount: parsedContent.edges?.length || 0
        });
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.log('Using EMS template as fallback');
        const templateContent = await loadEMSTemplate();
        await saveDiagramData(projectId, templateContent);
        return res.json({
          nodes: templateContent.nodes,
          edges: templateContent.edges
        });
      }

      // Validate the response structure
      if (!parsedContent.nodes || !Array.isArray(parsedContent.nodes) || 
          !parsedContent.edges || !Array.isArray(parsedContent.edges)) {
        console.error('Invalid response structure:', parsedContent);
        console.log('Using EMS template as fallback');
        const templateContent = await loadEMSTemplate();
        await saveDiagramData(projectId, templateContent);
        return res.json({
          nodes: templateContent.nodes,
          edges: templateContent.edges
        });
      }

      // Validate node properties
      for (const node of parsedContent.nodes) {
        if (!node.id || !node.type || !node.position || !node.data) {
          console.error('Invalid node structure:', node);
          console.log('Using EMS template as fallback');
          const templateContent = await loadEMSTemplate();
          await saveDiagramData(projectId, templateContent);
          return res.json({
            nodes: templateContent.nodes,
            edges: templateContent.edges
          });
        }

        // Ensure required properties
        node.width = node.width || 150;
        node.height = node.height || 87;
        node.selected = false;
        node.dragging = false;
        node.positionAbsolute = { ...node.position };
      }

      // Validate edge properties
      for (const edge of parsedContent.edges) {
        if (!edge.id || !edge.source || !edge.target) {
          console.error('Invalid edge structure:', edge);
          console.log('Using EMS template as fallback');
          const templateContent = await loadEMSTemplate();
          await saveDiagramData(projectId, templateContent);
          return res.json({
            nodes: templateContent.nodes,
            edges: templateContent.edges
          });
        }

        // Ensure required properties
        edge.type = edge.type || 'step';
        edge.style = edge.style || { stroke: "#000", strokeWidth: 2 };
        edge.animated = false;
        edge.markerEnd = edge.markerEnd || { type: "arrowclosed", width: 20, height: 20 };
      }

      // Save the final diagram data
      await saveDiagramData(projectId, parsedContent);
      res.json({
        nodes: parsedContent.nodes,
        edges: parsedContent.edges
      });
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

// Step 2: Generation API - Convert design plan to diagram layout
const generateDiagramLayout = async (req, res) => {
  try {
    console.log('Received generate-layout request:', {
      body: req.body,
      params: req.params
    });

    const { nodes, connections } = req.body;

    // Validate input
    if (!nodes || !connections) {
      console.log('Validation failed:', { nodes, connections });
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          nodes: !nodes ? 'Nodes are required' : null,
          connections: !connections ? 'Connections are required' : null
        }
      });
    }

    // Get system message from configuration
    const systemMessage = getGenerateLayoutSystemMessage();

    console.log('Sending request to OpenAI...');
    console.log('Request data:', {
      nodesCount: nodes.length,
      connectionsCount: connections.length,
      systemMessageLength: systemMessage.length
    });

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: JSON.stringify({ nodes, connections }) }
      ],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 2000
    });

    console.log('OpenAI response received:', {
      hasContent: !!completion.choices[0]?.message?.content,
      contentLength: completion.choices[0]?.message?.content?.length || 0
    });

    const content = completion.choices[0].message.content;
    console.log('Response content preview:', content.substring(0, 100) + '...');

    let diagramLayout;
    try {
      // Try to extract JSON if there's any surrounding text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      diagramLayout = JSON.parse(jsonMatch[0]);
      console.log('Parsed layout:', {
        hasNodes: !!diagramLayout.nodes,
        nodesCount: diagramLayout.nodes?.length || 0,
        hasEdges: !!diagramLayout.edges,
        edgesCount: diagramLayout.edges?.length || 0
      });
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }
    
    // Validate the response structure
    if (!diagramLayout.nodes || !Array.isArray(diagramLayout.nodes) || !diagramLayout.edges || !Array.isArray(diagramLayout.edges)) {
      console.error('Invalid response structure:', diagramLayout);
      throw new Error('Invalid response structure from OpenAI');
    }

    // Validate node properties
    diagramLayout.nodes.forEach(node => {
      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        throw new Error(`Invalid position for node ${node.id}`);
      }
      // Ensure required properties
      node.selected = false;
      node.dragging = false;
      node.positionAbsolute = { ...node.position };
      if (!node.width) node.width = 100;
      if (!node.height) node.height = 87;
    });

    // Validate edge properties
    diagramLayout.edges.forEach(edge => {
      if (!edge.style) edge.style = { stroke: "#000", strokeWidth: 2 };
      if (!edge.markerEnd) edge.markerEnd = { type: "arrowclosed", width: 20, height: 20 };
      if (!edge.animated) edge.animated = false;
      if (!edge.type) edge.type = "step";
    });

    console.log('Sending successful response');
    res.json(diagramLayout);
  } catch (error) {
    console.error('Diagram generation error:', {
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
      message: 'Error generating diagram layout', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Export the functions
module.exports = {
  interpretChat,
  generateDiagramLayout
}; 