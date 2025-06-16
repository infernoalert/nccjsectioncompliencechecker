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
        lastUpdated: new Date()
      };
      await user.save();

      return thread.id;
    } catch (error) {
      console.error('Error in getOrCreateThread:', error);
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

  async sendMessage(userId, message) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const threadId = await this.getOrCreateThread(userId);
      const assistantId = await this.getAssistantId('design'); // Default to design assistant

      // Add message to thread
      await this.openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message
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
        threadId
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