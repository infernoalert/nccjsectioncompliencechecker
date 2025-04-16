const Joi = require('joi');

const projectSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(500),
  buildingType: Joi.string().required().valid(
    'retail_small', 'retail_medium', 'retail_large',
    'office_small', 'office_medium', 'office_large',
    'industrial_small', 'industrial_medium', 'industrial_large'
  ),
  location: Joi.string().required(),
  floorArea: Joi.number().required().min(0),
  climateZone: Joi.string().hex().length(24),
  buildingFabric: Joi.string().hex().length(24),
  specialRequirements: Joi.array().items(Joi.string().hex().length(24)),
  compliancePathway: Joi.string().hex().length(24)
});

const validateProject = (projectData) => {
  return projectSchema.validate(projectData, { abortEarly: false });
};

module.exports = {
  validateProject
}; 