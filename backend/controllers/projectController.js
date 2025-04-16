const Project = require('../models/Project');
const ClimateZone = require('../models/ClimateZone');
const BuildingFabric = require('../models/BuildingFabric');
const SpecialRequirement = require('../models/SpecialRequirement');
const CompliancePathway = require('../models/CompliancePathway');
const { validateProject } = require('../utils/validation');
const { getClimateZoneByLocation } = require('../utils/decisionTreeUtils');
const asyncHandler = require('express-async-handler');
const complianceService = require('../services/complianceService');
const reportService = require('../services/reportService');
const { getAllLocations } = require('../utils/locationUtils');
const ReportService = require('../services/reportService');
const buildingTypeMapping = require('../data/mappings/buildingTypeToClassification.json');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.user.id })
    .populate('climateZone')
    .populate('buildingFabric')
    .populate('specialRequirements')
    .populate('compliancePathway');
  res.json({
    success: true,
    data: projects
  });
});

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user.id
  })
    .populate('climateZone')
    .populate('buildingFabric')
    .populate('specialRequirements')
    .populate('compliancePathway');

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }
  res.json({
    success: true,
    data: project
  });
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
exports.createProject = asyncHandler(async (req, res) => {
  const { name, description, buildingType, location, floorArea } = req.body;

  // Validate building type using the mapping file
  const buildingTypeExists = buildingTypeMapping.buildingTypes.some(type => type.id === buildingType);
  if (!buildingTypeExists) {
    return res.status(400).json({
      success: false,
      error: 'Invalid building type'
    });
  }

  // Validate location and get climate zone
  const climateZone = getClimateZoneByLocation(location);
  if (!climateZone) {
    return res.status(400).json({
      success: false,
      error: 'Invalid location or could not determine climate zone'
    });
  }

  const project = new Project({
    name,
    description,
    owner: req.user._id,
    createdBy: req.user._id,
    buildingType,
    location,
    climateZone,
    floorArea
  });

  await project.save();

  res.status(201).json({
    success: true,
    data: project
  });
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res) => {
  const { buildingType, location } = req.body;

  // If building type is being updated, validate it
  if (buildingType) {
    const buildingTypeExists = buildingTypeMapping.buildingTypes.some(type => type.id === buildingType);
    if (!buildingTypeExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid building type'
      });
    }
  }

  // If location is being updated, validate it
  if (location) {
    const climateZone = getClimateZoneByLocation(location);
    if (!climateZone) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location'
      });
    }
    req.body.climateZone = climateZone;
  }

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Check compliance for a project
// @route   POST /api/projects/:id/check-compliance
// @access  Private
exports.checkCompliance = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is the owner
  if (project.owner.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized'
    });
  }

  const complianceResults = await complianceService.checkCompliance(req.params.id);
  res.status(200).json({
    success: true,
    data: complianceResults
  });
});

// @desc    Generate a compliance report for a project
// @route   GET /api/projects/:id/report
// @access  Private
exports.generateReport = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('buildingFabric');

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user has access to this project
  if (project.owner.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this project'
    });
  }

  const reportService = new ReportService(project);
  const report = await reportService.generateReport();

  res.json({
    success: true,
    data: report
  });
});

// @desc    Get all building types
// @route   GET /api/projects/building-types
// @access  Public
exports.getBuildingTypes = asyncHandler(async (req, res) => {
  const buildingTypes = buildingTypeMapping.buildingTypes.map(type => ({
    id: type.id,
    name: type.name,
    description: type.description,
    nccClassification: type.nccClassification
  }));

  res.json({
    success: true,
    data: buildingTypes
  });
});

// @desc    Get all locations
// @route   GET /api/projects/locations
// @access  Public
exports.getLocations = asyncHandler(async (req, res) => {
  const locations = getAllLocations();
  res.json({
    success: true,
    data: locations
  });
}); 