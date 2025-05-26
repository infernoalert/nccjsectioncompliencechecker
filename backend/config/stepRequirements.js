const STEP_REQUIREMENTS = {
  initial: {
    requiredFields: [
      {
        id: 'billing_required',
        type: 'boolean',
        description: 'Whether billing functionality is required',
        validation: (value) => typeof value === 'boolean'
      },
      {
        id: 'market_connection',
        type: 'boolean',
        description: 'Whether the project needs to be connected to the market',
        validation: (value) => typeof value === 'boolean'
      },
      {
        id: 'ancillary_plants',
        type: 'array',
        description: 'List of ancillary plants in the project',
        validation: (value) => Array.isArray(value) && value.length > 0
      },
      {
        id: 'building_type',
        type: 'string',
        description: 'Type of the building',
        validation: (value) => typeof value === 'string' && value.length > 0
      },
      {
        id: 'building_classification',
        type: 'string',
        description: 'Building classification according to NCC',
        validation: (value) => typeof value === 'string' && value.length > 0
      }
    ]
  },
  bom: {
    requiredFields: [
      {
        id: 'components',
        type: 'array',
        description: 'List of required components with quantities',
        validation: (value) => Array.isArray(value) && value.length > 0
      },
      {
        id: 'specifications',
        type: 'object',
        description: 'Detailed specifications for each component',
        validation: (value) => typeof value === 'object' && Object.keys(value).length > 0
      }
    ]
  },
  design: {
    requiredFields: [
      {
        id: 'diagram',
        type: 'object',
        description: 'Complete EMS diagram structure',
        validation: (value) => typeof value === 'object' && value.nodes && value.connections
      },
      {
        id: 'connections',
        type: 'array',
        description: 'All connections between components',
        validation: (value) => Array.isArray(value) && value.length > 0
      }
    ]
  },
  review: {
    requiredFields: [
      {
        id: 'compliance_check',
        type: 'object',
        description: 'NCC Section J compliance verification',
        validation: (value) => typeof value === 'object' && value.status
      },
      {
        id: 'optimization_suggestions',
        type: 'array',
        description: 'List of optimization suggestions',
        validation: (value) => Array.isArray(value)
      }
    ]
  },
  final: {
    requiredFields: [
      {
        id: 'implementation_plan',
        type: 'object',
        description: 'Detailed implementation plan',
        validation: (value) => typeof value === 'object' && value.steps
      },
      {
        id: 'documentation',
        type: 'object',
        description: 'Required documentation list',
        validation: (value) => typeof value === 'object' && value.requirements
      }
    ]
  }
};

const validateStepRequirements = (step, data) => {
  const requirements = STEP_REQUIREMENTS[step];
  if (!requirements) return { valid: false, errors: ['Invalid step'] };

  const errors = [];
  const validatedData = {};

  for (const field of requirements.requiredFields) {
    const value = data[field.id];
    
    if (value === undefined) {
      errors.push(`Missing required field: ${field.description}`);
      continue;
    }

    if (!field.validation(value)) {
      errors.push(`Invalid value for ${field.description}`);
      continue;
    }

    validatedData[field.id] = value;
  }

  return {
    valid: errors.length === 0,
    errors,
    validatedData
  };
};

module.exports = {
  STEP_REQUIREMENTS,
  validateStepRequirements
}; 