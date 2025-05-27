const { getInitialConfig } = require('../config/initialConfig');
const { getBOMConfig } = require('../config/bomConfig');
const { getDesignConfig } = require('../config/designConfig');
const { getReviewConfig } = require('../config/reviewConfig');
const { getFinalConfig } = require('../config/finalConfig');

const configMap = {
  initial: getInitialConfig,
  bom: getBOMConfig,
  design: getDesignConfig,
  review: getReviewConfig,
  final: getFinalConfig,
};

function getStepConfig(step, project, existingDiagram) {
  const fn = configMap[step];
  if (!fn) throw new Error(`No config found for step: ${step}`);
  if (step === 'design' || step === 'review' || step === 'final') {
    return fn(project, existingDiagram);
  }
  return fn(project);
}

module.exports = { getStepConfig }; 