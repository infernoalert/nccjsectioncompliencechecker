const StepRequirement = require('../models/StepRequirement');

// Keep the static configuration as fallback
const STATIC_STEP_REQUIREMENTS = {
  initial: {
    requiredFields: [
      {
        id: 'billing_required',
        type: 'boolean',
        description: 'Whether billing functionality is required',
        validation: (value) => typeof value === 'boolean'
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
    ],
    requirementMessage: 'Specify whether billing functionality is required for this project.'
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
    ],
    requirementMessage: 'Provide the bill of materials for the project.'
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
    ],
    requirementMessage: 'Design the complete EMS diagram and specify all connections.'
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
    ],
    requirementMessage: 'Please review if billing functionality is required for this project.'
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
    ],
    requirementMessage: 'Provide the final implementation plan and documentation.'
  }
};

// Function to get step requirements from database
const getStepRequirements = async (step) => {
  try {
    const stepRequirement = await StepRequirement.findOne({ step });
    if (!stepRequirement) {
      // Fallback to static configuration if not found in database
      return STATIC_STEP_REQUIREMENTS[step];
    }

    // Convert validation string back to function
    const requirements = {
      requiredFields: stepRequirement.requiredFields.map(field => ({
        ...field,
        validation: new Function('value', `return ${field.validation}`)
      })),
      requirementMessage: stepRequirement.requirementMessage
    };

    return requirements;
  } catch (error) {
    console.error('Error fetching step requirements:', error);
    // Fallback to static configuration on error
    return STATIC_STEP_REQUIREMENTS[step];
  }
};

function validateStepRequirements(step, data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['No data provided'] };
  }
  const reqs = STATIC_STEP_REQUIREMENTS[step]?.requiredFields || [];
  const errors = [];
  for (const field of reqs) {
    if (data[field.id] === undefined || data[field.id] === null) {
      errors.push(`${field.description || field.id} is required`);
    }
    // Add more field-specific validation here if needed
  }
  return { valid: errors.length === 0, errors };
}

module.exports = {
  getStepRequirements,
  validateStepRequirements,
  STATIC_STEP_REQUIREMENTS
}; 