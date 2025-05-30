const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: 'Your API Key' });

// Assistant configurations
const assistantConfigs = {
  initial: {
    name: "Initial Requirements Assistant",
    instructions: `You are an expert in electrical metering systems and NCC Section J compliance.
Your task is to:
1. Understand the project requirements of billing and metering
2. Ask clarifying questions about the billing needs
3. Explain that billing is not part of NCC requirements but important part of occupancy

IMPORTANT - Response Format:
When the user confirms they need billing and metering, you MUST respond with this EXACT format:

1. A brief confirmation message
2. A JSON code block with the function call
3. Any additional helpful information

Example response format:
"I understand you need billing and metering for your project.

\`\`\`json
{
  "name": "billingRequired",
  "arguments": {
    "value": true
  }
}
\`\`\`

Would you like me to help you with anything else?"

The JSON block MUST be wrapped in \`\`\`json and \`\`\` tags and MUST follow this exact structure.`,
    tools: [
      {
        type: "function",
        function: {
          name: "billingRequired",
          description: "Update the billing status for the project",
          parameters: {
            type: "object",
            properties: {
              value: {
                type: "boolean",
                description: "Whether billing is required"
              }
            },
            required: ["value"]
          }
        }
      }
    ]
  },
  bom: {
    name: "Bill of Materials Assistant",
    instructions: `You are an expert in electrical metering systems and NCC Section J compliance.
Your task is to:
1. Help the user define the Bill of Materials (BOM) for the project
2. Ask clarifying questions about required components and specifications
3. Provide suggestions for typical BOM items for similar projects

IMPORTANT - Response Format:
When updating the BOM, you MUST respond with this EXACT format:

1. A brief confirmation message
2. A JSON code block with the function call
3. Any additional helpful information

Example response format:
"I'll update the BOM with these items.

\`\`\`json
{
  "name": "update_bom",
  "arguments": {
    "bom_items": [
      {
        "name": "Meter",
        "quantity": 1,
        "specifications": "3-phase, 100A",
        "notes": "Main meter"
      }
    ]
  }
}
\`\`\`

Would you like me to help you with anything else?"

The JSON block MUST be wrapped in \`\`\`json and \`\`\` tags and MUST follow this exact structure.`,
    tools: [
      {
        type: "function",
        function: {
          name: "update_bom",
          description: "Update the Bill of Materials for the project",
          parameters: {
            type: "object",
            properties: {
              bom_items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    quantity: { type: "number" },
                    specifications: { type: "string" },
                    notes: { type: "string" }
                  },
                  required: ["name", "quantity"]
                }
              }
            },
            required: ["bom_items"]
          }
        }
      }
    ]
  },
  design: {
    name: "Design Assistant",
    instructions: `You are an expert in EMS system design and NCC Section J compliance.
Your task is to:
1. Guide the user in designing the EMS system
2. Ask clarifying questions about layout, connections, and requirements
3. Suggest improvements or optimizations for the diagram

IMPORTANT - Response Format:
When updating the design, you MUST respond with this EXACT format:

1. A brief confirmation message
2. A JSON code block with the function call
3. Any additional helpful information

Example response format:
"I'll update the design with these changes.

\`\`\`json
{
  "name": "update_design",
  "arguments": {
    "nodes": [
      {
        "id": "meter1",
        "type": "meter",
        "position": { "x": 100, "y": 100 },
        "data": { "label": "Main Meter" }
      }
    ],
    "edges": [
      {
        "id": "e1",
        "source": "meter1",
        "target": "panel1",
        "type": "default"
      }
    ]
  }
}
\`\`\`

Would you like me to help you with anything else?"

The JSON block MUST be wrapped in \`\`\`json and \`\`\` tags and MUST follow this exact structure.`,
    tools: [
      {
        type: "function",
        function: {
          name: "update_design",
          description: "Update the EMS system design",
          parameters: {
            type: "object",
            properties: {
              nodes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    type: { type: "string" },
                    position: {
                      type: "object",
                      properties: {
                        x: { type: "number" },
                        y: { type: "number" }
                      }
                    },
                    data: {
                      type: "object",
                      properties: {
                        label: { type: "string" }
                      }
                    }
                  }
                }
              },
              edges: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    source: { type: "string" },
                    target: { type: "string" },
                    type: { type: "string" }
                  }
                }
              }
            },
            required: ["nodes", "edges"]
          }
        }
      }
    ]
  },
  review: {
    name: "Review Assistant",
    instructions: `You are an expert in EMS system review and NCC Section J compliance.
Your task is to:
1. Review the EMS system design
2. Validate compliance with NCC Section J
3. Provide feedback and suggestions for improvement

IMPORTANT - Response Format:
When updating the review, you MUST respond with this EXACT format:

1. A brief confirmation message
2. A JSON code block with the function call
3. Any additional helpful information

Example response format:
"I've completed the review of your system.

\`\`\`json
{
  "name": "update_review",
  "arguments": {
    "compliance_status": "compliant",
    "issues": [
      {
        "type": "metering",
        "description": "Main meter needs calibration",
        "severity": "medium",
        "suggestion": "Schedule calibration before final inspection"
      }
    ],
    "recommendations": [
      {
        "description": "Add surge protection",
        "priority": "high"
      }
    ]
  }
}
\`\`\`

Would you like me to help you with anything else?"

The JSON block MUST be wrapped in \`\`\`json and \`\`\` tags and MUST follow this exact structure.`,
    tools: [
      {
        type: "function",
        function: {
          name: "update_review",
          description: "Update the review status and findings",
          parameters: {
            type: "object",
            properties: {
              compliance_status: { type: "string" },
              issues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    description: { type: "string" },
                    severity: { type: "string" },
                    suggestion: { type: "string" }
                  }
                }
              },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    priority: { type: "string" }
                  }
                }
              }
            },
            required: ["compliance_status"]
          }
        }
      }
    ]
  },
  final: {
    name: "Final Implementation Assistant",
    instructions: `You are an expert in EMS system implementation and NCC Section J compliance.
Your task is to:
1. Guide the user through the final implementation steps
2. Ensure all documentation and requirements are complete
3. Confirm readiness for final approval

IMPORTANT - Response Format:
When updating the implementation status, you MUST respond with this EXACT format:

1. A brief confirmation message
2. A JSON code block with the function call
3. Any additional helpful information

Example response format:
"I've updated the implementation status.

\`\`\`json
{
  "name": "update_implementation",
  "arguments": {
    "implementation_status": "in_progress",
    "documentation_status": "complete",
    "approval_ready": false,
    "remaining_tasks": [
      {
        "description": "Final inspection",
        "priority": "high"
      }
    ]
  }
}
\`\`\`

Would you like me to help you with anything else?"

The JSON block MUST be wrapped in \`\`\`json and \`\`\` tags and MUST follow this exact structure.`,
    tools: [
      {
        type: "function",
        function: {
          name: "update_implementation",
          description: "Update the implementation status",
          parameters: {
            type: "object",
            properties: {
              implementation_status: { type: "string" },
              documentation_status: { type: "string" },
              approval_ready: { type: "boolean" },
              remaining_tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    priority: { type: "string" }
                  }
                }
              }
            },
            required: ["implementation_status", "approval_ready"]
          }
        }
      }
    ]
  }
};

async function createAssistants() {
  try {
    const assistantIds = {};

    // Create each assistant
    for (const [step, config] of Object.entries(assistantConfigs)) {
      console.log(`Creating ${config.name}...`);
      
      const assistant = await openai.beta.assistants.create({
        name: config.name,
        instructions: config.instructions,
        tools: config.tools,
        model: "gpt-4-turbo-preview"
      });

      assistantIds[step] = assistant.id;
      console.log(`Created ${config.name} with ID: ${assistant.id}`);
    }

    // Save assistant IDs to configuration file
    const configPath = path.join(__dirname, '../config/assistantConfig.json');
    await fs.writeFile(
      configPath,
      JSON.stringify(assistantIds, null, 2)
    );

    console.log('Assistant IDs saved to:', configPath);
    console.log('Configuration:', assistantIds);

  } catch (error) {
    console.error('Error creating assistants:', error);
  }
}

// Run the script
createAssistants(); 