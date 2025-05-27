const { getInitialConfig } = require('../config/initialConfig');
const { getBOMConfig } = require('../config/bomConfig');
const { getDesignConfig } = require('../config/designConfig');
const { getReviewConfig } = require('../config/reviewConfig');
const { getFinalConfig } = require('../config/finalConfig');

// Step mapping
const STEP_KEY_TO_NUMBER = {
  initial: 1,
  bom: 2,
  design: 3,
  review: 4,
  final: 5
};

const configMap = {
  initial: getInitialConfig,
  bom: getBOMConfig,
  design: getDesignConfig,
  review: getReviewConfig,
  final: getFinalConfig,
};

function getStepConfig(step, project, existingDiagram) {
  // Handle both numeric and string step identifiers
  const stepKey = typeof step === 'number' 
    ? Object.entries(STEP_KEY_TO_NUMBER).find(([_, num]) => num === step)?.[0]
    : step;

  if (!stepKey) {
    throw new Error(`Invalid step identifier: ${step}`);
  }

  const fn = configMap[stepKey];
  if (!fn) {
    throw new Error(`No config found for step: ${stepKey}`);
  }

  if (stepKey === 'design' || stepKey === 'review' || stepKey === 'final') {
    return fn(project, existingDiagram);
  }
  return fn(project);
}

module.exports = {
  getStepConfig,
  STEP_KEY_TO_NUMBER
}; 