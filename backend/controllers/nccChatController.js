const OpenAI = require('openai');
const Project = require('../models/Project');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getNccSystemMessage = (project) => `
You are an expert in NCC Section J compliance. You must only answer questions related to the content, requirements, and compliance aspects of Section J of the National Construction Code (NCC), specifically as they apply to the user's project. If the user asks about system design, diagrams, layouts, or energy metering structures, politely respond that you are only able to provide guidance on NCC Section J compliance and cannot assist with those topics. Do not suggest, generate, or assist with commands, layout designs, or system structure steps under any circumstances.
Project details:
- Building Type: ${project.buildingType}
- Classification: ${project.buildingClassification?.classType || 'Not specified'}
- Location: ${project.location}
- Floor Area: ${project.floorArea} m²
`;

exports.nccSectionJChat = async (req, res) => {
  try {
    const { projectId, message, history } = req.body;
    if (!projectId || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const systemMessage = getNccSystemMessage(project);
    let userPrompt = message;
    if (Array.isArray(history) && history.length > 0) {
      userPrompt = history.slice(-2).map((conv, i) =>
        `Previous Conversation ${i+1} (most recent last):\nUser: ${conv.user}\nAI: ${conv.ai}`
      ).join('\n\n') + `\n\nCurrent User Request: ${message}`;
    }

    // Log what we send to OpenAI
    console.log('OpenAI Request (NCC Chat):', { systemMessage, userPrompt });

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      model: "gpt-4-turbo",
    });

    // Log what we receive from OpenAI
    console.log('OpenAI Response (NCC Chat):', completion.choices[0].message.content);

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: 'Error processing NCC Section J chat request', error: error.message });
  }
}; 