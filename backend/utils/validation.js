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

const loadSchema = Joi.object({
  type: Joi.string().valid('load').required(),
  name: Joi.string().required(),
  powerRating: Joi.number().min(0).default(0),
  voltage: Joi.number().min(0).default(0),
  current: Joi.number().min(0).default(0)
});

const monitoringSchema = Joi.object({
  label: Joi.string().required(),
  panel: Joi.string().required(),
  monitoringDeviceType: Joi.string().valid('smart-meter', 'general-meter', 'auth-meter', 'memory-meter').required(),
  description: Joi.string().allow('').default(''),
  connection: Joi.string().allow('').default(''),
  status: Joi.string().valid('active', 'inactive', 'maintenance').default('active'),
  lastUpdated: Joi.date().default(() => new Date())
});

const refIdSchema = Joi.object({
  type: Joi.string().valid('load', 'monitoring').required(),
  refId: Joi.string().hex().length(24).required()
});

const projectValueSchema = refIdSchema;

const validateProjectValue = (data) => {
  return projectValueSchema.validate(data);
};

module.exports = {
  validateProject,
  validateProjectValue,
  projectSchema,
  loadSchema,
  monitoringSchema
}; 