const STEPS = {
  INITIAL: 'initial',
  BOM: 'bom',
  DESIGN: 'design',
  REVIEW: 'review',
  FINAL: 'final'
};

const STEP_ORDER = [
  STEPS.INITIAL,
  STEPS.BOM,
  STEPS.DESIGN,
  STEPS.REVIEW,
  STEPS.FINAL
];

const STEP_TRANSITIONS = {
  [STEPS.INITIAL]: [STEPS.BOM],
  [STEPS.BOM]: [STEPS.DESIGN],
  [STEPS.DESIGN]: [STEPS.REVIEW],
  [STEPS.REVIEW]: [STEPS.FINAL],
  [STEPS.FINAL]: []
};

const STEP_REQUIREMENTS = {
  [STEPS.INITIAL]: {
    name: 'Initial Requirements',
    description: 'Gather and understand project requirements',
    requiredFields: ['buildingType', 'buildingClassification', 'location', 'floorArea']
  },
  [STEPS.BOM]: {
    name: 'Bill of Materials',
    description: 'Define required components and quantities',
    requiredFields: ['components', 'quantities', 'specifications']
  },
  [STEPS.DESIGN]: {
    name: 'System Design',
    description: 'Create and modify EMS diagram',
    requiredFields: ['diagram', 'connections', 'layout']
  },
  [STEPS.REVIEW]: {
    name: 'Design Review',
    description: 'Review and validate design',
    requiredFields: ['compliance', 'optimization', 'verification']
  },
  [STEPS.FINAL]: {
    name: 'Final Approval',
    description: 'Final confirmation and documentation',
    requiredFields: ['approval', 'documentation', 'implementation']
  }
};

module.exports = {
  STEPS,
  STEP_ORDER,
  STEP_TRANSITIONS,
  STEP_REQUIREMENTS
}; 