const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: 'Your API' });

// Assistant configuration for initial step
const assistantConfig = {
  name: "Initial Requirements Assistant",
  instructions: `You are an expert in electrical metering systems and NCC Section J compliance.
  
Your task is to:
1. First determine the building classification (Class 1-10)
2. Then gather the initial project requirements, particularly related to building services
3. Ask clarifying questions to complete the following fields:
   - Building Classification (must be determined first)
   - Building Services (air conditioning, lighting, etc.)
   - Any ancillary plants
   - Number of shared areas (for Class 2 buildings only)

Guidelines:
- ALWAYS ask about building classification first
- Explain the importance of building classification for compliance
- Ask one question at a time
- Confirm understanding before proceeding
- Provide clear explanations for requirements
- Use simple, non-technical language when possible
- Maintain a professional and helpful tone

Example conversation:
User: "I need to set up the building services"
Assistant: "I'll help you with that. First, I need to know the building classification. Could you tell me what type of building this is? For example, is it a Class 2 (apartment building), Class 5 (office building), or another classification?"

User: "It's a Class 5 building"
Assistant: "Thank you for confirming this is a Class 5 building. Now, let's discuss the building services. Does your building require air conditioning?"

User: "Yes, we need air conditioning"
Assistant: "I've noted that air conditioning is required. What about artificial lighting? Will you need that in your building?"

User: "Yes, and also appliance power and central hot water supply."
Assistant: "I've updated the requirements as follows:
- Artificial Lighting: Yes
- Appliance Power: Yes
- Central Hot Water Supply: Yes
If you have more changes, let me know!"

Focus on gathering accurate information through natural conversation, starting with building classification. The system will handle the formatting and data structure.`,
  tools: [
    {
      type: "function",
      function: {
        name: "update_initial_requirements",
        description: "Update the initial requirements for the project",
        parameters: {
          type: "object",
          properties: {
            buildingClassification: {
              type: "string",
              description: "The NCC building classification (Class_1 through Class_10)",
              enum: ["Class_1", "Class_2", "Class_3", "Class_4", "Class_5", "Class_6", "Class_7", "Class_8", "Class_9", "Class_10"]
            },
            buildingServices: {
              type: "object",
              properties: {
                airConditioning: { type: "boolean" },
                artificialLighting: { type: "boolean" },
                appliancePower: { type: "boolean" },
                centralHotWaterSupply: { type: "boolean" },
                internalTransportDevices: { type: "boolean" },
                renewableEnergy: { type: "boolean" },
                evChargingEquipment: { type: "boolean" },
                batterySystems: { type: "boolean" }
              },
              required: [
                "airConditioning",
                "artificialLighting",
                "appliancePower",
                "centralHotWaterSupply",
                "internalTransportDevices",
                "renewableEnergy",
                "evChargingEquipment",
                "batterySystems"
              ]
            },
            ancillaryPlants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exists: { type: "boolean" },
                  name: { type: "string" }
                },
                required: ["exists", "name"]
              }
            },
            sharedAreasCount: {
              type: "integer",
              description: "Number of shared areas > 500m² (only for Class_2 buildings)"
            }
          },
          required: ["buildingClassification", "buildingServices", "ancillaryPlants"]
        }
      }
    }
  ]
};

async function createAssistant() {
  try {
    console.log(`Creating ${assistantConfig.name}...`);
    
    const assistant = await openai.beta.assistants.create({
      name: assistantConfig.name,
      instructions: assistantConfig.instructions,
      tools: assistantConfig.tools,
      model: "gpt-4-turbo-preview"
    });

    // Save assistant ID to configuration file
    const configPath = path.join(__dirname, '../config/assistantConfig.json');
    await fs.writeFile(
      configPath,
      JSON.stringify({ initial: assistant.id }, null, 2)
    );

    console.log(`Created ${assistantConfig.name} with ID: ${assistant.id}`);
    console.log('Assistant ID saved to:', configPath);

  } catch (error) {
    console.error('Error creating assistant:', error);
  }
}

// Run the script
createAssistant(); 