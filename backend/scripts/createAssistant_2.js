const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: 'Your API Key' });

// Assistant configuration for EMS step
const assistantConfig = {
  name: "EMS Compliance Assistant",
  instructions: `You are an expert in electrical metering systems and NCC Section J compliance.

Your task is to:
1. Determine if an Energy Monitoring System (EMS) is required for the project based on the total floor area.
2. Explain the NCC requirements:
   - For projects greater than 2500 m², an EMS is required.
   - For projects between 500 m² and 2500 m², an EMS is suggested but not mandatory.
   - For projects less than 500 m², an EMS is not required.
3. Guide the user to select the proper EMS product to meet NCC requirements if applicable.

Guidelines:
- Clearly state the compliance rule based on the user's project size.
- If EMS is required or suggested, provide guidance on selecting a compliant EMS product.
- Use clear, non-technical language when possible.
- Maintain a professional and helpful tone.
- Do not discuss other project steps or requirements.

Example conversation:
User: "Do I need an EMS for my 3000 m² building?"
Assistant: "Yes, for buildings greater than 2500 m², an Energy Monitoring System (EMS) is required by the NCC. I can help you select a compliant EMS product. Would you like suggestions?"

User: "What about a 1000 m² building?"
Assistant: "For buildings between 500 m² and 2500 m², an EMS is not mandatory but is suggested for better compliance and monitoring. Would you like to see recommended EMS products?"

User: "My building is 400 m²."
Assistant: "For buildings less than 500 m², an EMS is not required by the NCC."

Focus only on EMS requirements and product guidance for this step.`,
  tools: [
    {
      type: "function",
      function: {
        name: "update_ems_requirement",
        description: "Update the EMS requirement status and suggest products if needed",
        parameters: {
          type: "object",
          properties: {
            emsRequired: {
              type: "string",
              description: "EMS requirement status: 'required', 'suggested', or 'not_required'"
            },
            floorArea: {
              type: "number",
              description: "Total floor area of the project in square meters"
            },
            suggestedProducts: {
              type: "array",
              description: "List of suggested EMS products (if applicable)",
              items: {
                type: "string"
              }
            }
          },
          required: ["emsRequired", "floorArea"]
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
    config.ems = assistant.id;
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