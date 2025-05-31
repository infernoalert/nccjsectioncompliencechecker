const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: 'Your API Key' });

// Assistant configuration for BOM step
const assistantConfig = {
  name: "NCC Section J BOM Assistant",
  instructions: `You are an expert in NCC Section J compliance and building services requirements.

Your task is to:
1. Process the initial requirements from step 1:
   - Building Classification (e.g., Class 1a)
   - Floor Area
   - Building Services (only focus on services marked as "true" or "yes")
   - Any ancillary plants that exist
2. Based on these requirements, provide:
   - Required building services components ONLY for the services that were marked as required
   - Detailed BOM specifications for each required service
   - Integration requirements with EMS (if applicable)

IMPORTANT GUIDELINES:
- ONLY focus on building services that were marked as required (true/yes) in step 1
- DO NOT ask about or suggest services that were marked as not required (false/no)
- If a service was not required in step 1, do not include it in the BOM
- For each required service, provide specific component recommendations
- Consider the building classification and floor area in your recommendations

Example of handling requirements:
If step 1 data shows:
{
  "buildingServices": {
    "airConditioning": false,
    "artificialLighting": true,
    "appliancePower": true,
    "centralHotWaterSupply": false
  }
}
Then:
- DO focus on: artificial lighting and appliance power components
- DO NOT ask about: air conditioning or hot water systems

Example conversation:
User: "What components do I need for my building?"
Assistant: "Based on your initial requirements, I see that artificial lighting and appliance power are required. Let me help you with the specific components needed for these services. Would you like to start with the lighting system components?"

User: "Tell me about the lighting system"
Assistant: "For your artificial lighting system, I'll provide a detailed component list including energy-efficient fixtures, controls, and monitoring interfaces. Would you like me to break this down by specific components?"

Focus on providing BOM guidance ONLY for the services that were marked as required in step 1.`,
  tools: [
    {
      type: "function",
      function: {
        name: "update_bom_requirements",
        description: "Update the BOM requirements and component specifications based on initial requirements",
        parameters: {
          type: "object",
          properties: {
            initialRequirements: {
              type: "object",
              description: "Requirements from step 1",
              properties: {
                buildingClassification: { type: "string" },
                floorArea: { type: "number" },
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
                  }
                },
                ancillaryPlants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      exists: { type: "boolean" },
                      name: { type: "string" }
                    }
                  }
                }
              }
            },
            components: {
              type: "array",
              description: "List of required components for each required service",
              items: {
                type: "object",
                properties: {
                  service: { type: "string" },
                  components: { type: "array", items: { type: "string" } },
                  specifications: { type: "object" }
                }
              }
            }
          },
          required: ["initialRequirements", "components"]
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
    let config = {};
    try {
      const existing = await fs.readFile(configPath, 'utf-8');
      config = JSON.parse(existing);
    } catch (e) {}
    config.bom = assistant.id;
    await fs.writeFile(
      configPath,
      JSON.stringify(config, null, 2)
    );

    console.log(`Created ${assistantConfig.name} with ID: ${assistant.id}`);
    console.log('Assistant ID saved to:', configPath);

  } catch (error) {
    console.error('Error creating assistant:', error);
  }
}

// Run the script
createAssistant(); 