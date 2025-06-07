const assistantManager = require('../services/assistantManager');

// Step mapping
const STEP_KEY_TO_NUMBER = {
  initial: 1,
  bom: 2,
  design: 3,
  review: 4,
  final: 5
};

async function getStepConfig(step, project, existingDiagram) {
  // Handle both numeric and string step identifiers
  const stepKey = typeof step === 'number' 
    ? Object.entries(STEP_KEY_TO_NUMBER).find(([_, num]) => num === step)?.[0]
    : step;

  if (!stepKey) {
    throw new Error(`Invalid step identifier: ${step}`);
  }

  try {
    // Get the assistant ID for this step
    const assistantId = await assistantManager.getAssistantId(stepKey);
    return {
      assistantId,
      stepKey,
      project,
      existingDiagram
    };
  } catch (error) {
    throw new Error(`Failed to get assistant configuration for step: ${stepKey}`);
  }
}

module.exports = {
  getStepConfig,
  STEP_KEY_TO_NUMBER
}; 