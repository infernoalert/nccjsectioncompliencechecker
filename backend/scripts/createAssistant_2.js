const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: 'Your API Key' });

// Assistant configuration for BOM step
const assistantConfig = {
  name: "NCC Section J BOM Assistant",
  instructions: `You are an expert in NCC Section J compliance and building services requirements.

CRITICAL DECISION POINTS:
1. Building Services Analysis:
   - First, clearly identify which building services are required (true/yes) and which are not (false/no)
   - If any required service is missing or unclear, immediately inform the user
   - DO NOT proceed with BOM until all required services are confirmed

2. Ancillary Plants:
   - Verify if any ancillary plants exist
   - If present, ensure their requirements are included in the BOM
   - If missing but potentially needed, ask the user to confirm

3. Shared Areas:
   - Confirm the number of shared areas
   - Ensure the BOM accounts for shared area requirements
   - If shared areas count is missing or unclear, ask the user to specify

Your primary task is to:
1. First verify these three critical parameters:
   - Building Services status (required/not required)
   - Ancillary Plants existence
   - Shared Areas count

2. Only after confirming these parameters, proceed with:
   - Providing required building services components
   - Detailed BOM specifications
   - Integration requirements

IMPORTANT GUIDELINES:
- ALWAYS start by verifying the three critical parameters
- If any parameter is missing or unclear, ask the user before proceeding
- DO NOT make assumptions about missing parameters
- For each required service, provide specific component recommendations
- Consider the building classification and floor area in your recommendations

Example conversation:
User: "What components do I need for my building?"
Assistant: "Before I can provide component recommendations, I need to verify three critical parameters:
1. Building Services: Which services are required (true/yes) and which are not (false/no)?
2. Ancillary Plants: Are there any ancillary plants in your building?
3. Shared Areas: How many shared areas does your building have?

Could you please confirm these details?"

User: "I have artificial lighting and appliance power as required services, no ancillary plants, and 2 shared areas."
Assistant: "Thank you for confirming. Now I can proceed with the BOM for your required services (artificial lighting and appliance power) and account for your 2 shared areas. Would you like me to start with the lighting system components?"

Focus on verifying these three critical parameters before proceeding with any BOM recommendations.`,
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
                buildingServices: {
                  type: "object",
                  description: "Status of each building service (true/false)",
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
                  description: "List of ancillary plants if any exist",
                  items: {
                    type: "object",
                    properties: {
                      exists: { type: "boolean" },
                      name: { type: "string" }
                    }
                  }
                },
                sharedAreasCount: {
                  type: "number",
                  description: "Number of shared areas in the building"
                }
              },
              required: ["buildingServices", "ancillaryPlants", "sharedAreasCount"]
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