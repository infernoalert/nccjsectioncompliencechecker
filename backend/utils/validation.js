const Joi = require('joi');

const projectSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(500),
  buildingType: Joi.string().required(),
  location: Joi.string().required(),
  floorArea: Joi.number().required().min(0),
  totalAreaOfHabitableRooms: Joi.number().min(0).allow(null),
  climateZone: Joi.string().hex().length(24),
  buildingFabric: Joi.string().hex().length(24),
  specialRequirements: Joi.array().items(Joi.string().hex().length(24)),
  compliancePathway: Joi.string().hex().length(24)
});

const validateProject = (projectData) => {
  return projectSchema.validate(projectData, { abortEarly: false });
};

const projectValueSchema = Joi.object({
  systemType: Joi.string().required(),
  name: Joi.string().required(),
  partNumber: Joi.string().required(),
  description: Joi.string(),
  manufacturer: Joi.string(),
  specifications: Joi.object(),
  status: Joi.string().valid('active', 'inactive', 'maintenance'),
  connectedLoads: Joi.array().items(Joi.string())
});

const validateProjectValue = (data) => {
  return projectValueSchema.validate(data);
};

module.exports = {
  validateProject,
  validateProjectValue
}; 