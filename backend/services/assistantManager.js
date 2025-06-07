const OpenAI = require('openai');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const Project = require('../models/Project');

class AssistantManager {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.assistantIds = null;
    this.loadAssistantIds();
  }

  async loadAssistantIds() {
    try {
      const configPath = path.join(__dirname, '../config/assistantConfig.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.assistantIds = JSON.parse(configData);
    } catch (error) {
      console.error('Error loading assistant IDs:', error);
      throw new Error('Failed to load assistant configuration');
    }
  }

  async getAssistantId(step) {
    if (!this.assistantIds) {
      await this.loadAssistantIds();
    }
    const assistantId = this.assistantIds[step];
    if (!assistantId) {
      throw new Error(`No assistant configured for step: ${step}`);
    }
    return assistantId;
  }

  async getOrCreateThread(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // If user already has a thread, return it
      if (user.assistantThread?.threadId) {
        return user.assistantThread.threadId;
      }

      // Create new thread
      const thread = await this.openai.beta.threads.create();
      
      // Update user with thread ID
      user.assistantThread = {
        threadId: thread.id,
        currentStep: 'initial',
        lastUpdated: new Date()
      };
      await user.save();

      return thread.id;
    } catch (error) {
      console.error('Error in getOrCreateThread:', error);
      throw error;
    }
  }

  async updateUserStep(userId, step) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate step
      const validSteps = ['initial', 'bom', 'design', 'review', 'final'];
      if (!validSteps.includes(step)) {
        throw new Error(`Invalid step: ${step}`);
      }

      user.assistantThread.currentStep = step;
      user.assistantThread.lastUpdated = new Date();
      await user.save();

      return user.assistantThread;
    } catch (error) {
      console.error('Error in updateUserStep:', error);
      throw error;
    }
  }

  async waitForRunCompletion(threadId, runId, maxAttempts = 30) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      const runStatus = await this.openai.beta.threads.runs.retrieve(threadId, runId);
      
      if (runStatus.status === 'completed') {
        return runStatus;
      }
      
      if (runStatus.status === 'requires_action') {
        return runStatus;
      }
      
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new Error('Run timed out');
  }

  async sendMessage(userId, message, step, projectId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const threadId = await this.getOrCreateThread(userId);
      const assistantId = await this.getAssistantId(step);

      // If this is the BOM step, include initial requirements
      let finalMessage = message;
      if (step === 'bom') {
        console.log('\n=== Preparing Data for BOM Agent ===');
        // Get the project data using the provided projectId
        const project = await Project.findById(projectId);
        if (!project) {
          throw new Error('Project not found');
        }
        console.log('Project:', project.name);
        console.log('Project ID:', project._id);
        
        // Get initial requirements directly from project
        const initialRequirements = project.stepRequirements?.initial || project.stepRequirements;
        if (!initialRequirements) {
          console.log('No initial requirements found in project');
          throw new Error('Initial requirements not found');
        }
        
        console.log('Initial Requirements:');
        console.log('- Building Classification:', initialRequirements.buildingClassification);
        console.log('- Building Services:', JSON.stringify(initialRequirements.buildingServices, null, 2));
        console.log('- Ancillary Plants:', JSON.stringify(initialRequirements.ancillaryPlants, null, 2));
        console.log('- Shared Areas Count:', initialRequirements.sharedAreasCount);
        
        // Format initial requirements for the BOM assistant
        const formattedRequirements = {
          buildingClassification: initialRequirements.buildingClassification,
          floorArea: initialRequirements.floorArea,
          buildingServices: initialRequirements.buildingServices,
          ancillaryPlants: initialRequirements.ancillaryPlants,
          sharedAreasCount: initialRequirements.sharedAreasCount
        };

        // Add initial requirements to the message
        finalMessage = `Initial Requirements:\n${JSON.stringify(formattedRequirements, null, 2)}\n\nUser Message:\n${message}`;
      }

      // Add message to thread
      await this.openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: finalMessage
      });

      // Run the assistant
      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId
      });

      // Wait for the run to complete
      const runStatus = await this.waitForRunCompletion(threadId, run.id);

      // Handle function calls if needed
      if (runStatus.status === 'requires_action') {
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        await this.handleFunctionCall(threadId, run.id, toolCalls);
        
        // Wait for the run to complete after function call
        await this.waitForRunCompletion(threadId, run.id);
      }

      // Get the messages
      const messages = await this.openai.beta.threads.messages.list(threadId);
      const assistantMessages = messages.data
        .filter(m => m.role === 'assistant' && m.run_id === run.id)
        .sort((a, b) => b.created_at - a.created_at);

      if (assistantMessages.length === 0) {
        throw new Error('No response from assistant');
      }

      return {
        message: assistantMessages[0].content[0].text.value,
        threadId,
        currentStep: step
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  async handleFunctionCall(threadId, runId, toolCalls) {
    try {
      const toolOutputs = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        // Handle different function calls based on the current step
        let output;
        switch (functionName) {
          case 'update_initial_requirements':
            output = { 
              success: true, 
              buildingType: functionArgs.buildingType,
              size: functionArgs.size,
              buildingServices: functionArgs.buildingServices,
              ancillaryPlants: functionArgs.ancillaryPlants || [],
              sharedAreasCount: functionArgs.sharedAreasCount
            };
            break;
          case 'update_bom':
            output = { success: true, bom_items: functionArgs.bom_items };
            break;
          case 'update_design':
            output = { success: true, nodes: functionArgs.nodes, edges: functionArgs.edges };
            break;
          case 'update_review':
            output = { success: true, ...functionArgs };
            break;
          case 'update_implementation':
            output = { success: true, ...functionArgs };
            break;
          default:
            output = { success: false, error: 'Unknown function' };
        }

        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify(output)
        });
      }

      // Submit tool outputs
      await this.openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
        tool_outputs: toolOutputs
      });

      return toolOutputs;
    } catch (error) {
      console.error('Error in handleFunctionCall:', error);
      throw error;
    }
  }
}

module.exports = new AssistantManager(); 