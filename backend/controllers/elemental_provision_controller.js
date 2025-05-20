const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const ClimateZone = require('../models/ClimateZone');
const BuildingFabric = require('../models/BuildingFabric');
const SpecialRequirement = require('../models/SpecialRequirement');
const CompliancePathway = require('../models/CompliancePathway');
const { validateProject } = require('../utils/validation');
const { getBuildingClassification, getClimateZoneByLocation } = require('../utils/decisionTreeUtils');
const asyncHandler = require('express-async-handler');
const complianceService = require('../services/complianceService');
const ReportService = require('../services/elemental_provision_reportService');
const { getAllLocations } = require('../utils/locationUtils');
const { getSection } = require('../utils/decisionTreeFactory');
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

  // If buildingClassification is not set or is incomplete, try to populate it
  if (!project.buildingClassification?.classType) {
    try {
      const classificationInfo = await getBuildingClassification(project.buildingType);
      project.buildingClassification = {
        classType: classificationInfo.classType,
        name: classificationInfo.name,
        description: classificationInfo.description,
        typicalUse: classificationInfo.typicalUse,
        commonFeatures: classificationInfo.commonFeatures,
        notes: classificationInfo.notes,
        technicalDetails: classificationInfo.technicalDetails
      };
      await project.save();
    } catch (error) {
      console.error('Error populating building classification:', error);
    }
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

  // Validate building type using the decision tree
  let buildingClassification;
  try {
    const classificationInfo = await getBuildingClassification(buildingType);
    buildingClassification = {
      classType: classificationInfo.classType,
      name: classificationInfo.name,
      description: classificationInfo.description,
      typicalUse: classificationInfo.typicalUse,
      commonFeatures: classificationInfo.commonFeatures,
      notes: classificationInfo.notes,
      technicalDetails: classificationInfo.technicalDetails
    };
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid building type'
    });
  }

  // Validate location and get climate zone
  let climateZone;
  try {
    climateZone = await getClimateZoneByLocation(location);
  } catch (error) {
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
    buildingClassification,
    location,
    climateZone,
    floorArea,
    totalAreaOfHabitableRooms: req.body.totalAreaOfHabitableRooms
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
  const { name, description, buildingType, location, floorArea } = req.body;

  // Get the project
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is the owner
  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to update this project'
    });
  }

  // If building type is being updated, validate it
  if (buildingType && buildingType !== project.buildingType) {
    try {
      const classificationInfo = await getBuildingClassification(buildingType);
      project.buildingClassification = {
        classType: classificationInfo.classType,
        name: classificationInfo.name,
        description: classificationInfo.description,
        typicalUse: classificationInfo.typicalUse,
        commonFeatures: classificationInfo.commonFeatures,
        notes: classificationInfo.notes,
        technicalDetails: classificationInfo.technicalDetails
      };
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid building type'
      });
    }
  }

  // If location is being updated, validate it
  if (location && location !== project.location) {
    try {
      const climateZone = await getClimateZoneByLocation(location);
      project.climateZone = climateZone;
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location or could not determine climate zone'
      });
    }
  }

  // Update the project
  project.name = name || project.name;
  project.description = description || project.description;
  project.buildingType = buildingType || project.buildingType;
  project.location = location || project.location;
  project.floorArea = floorArea || project.floorArea;
  project.totalAreaOfHabitableRooms = req.body.totalAreaOfHabitableRooms !== undefined ? req.body.totalAreaOfHabitableRooms : project.totalAreaOfHabitableRooms;

  await project.save();

  res.json({
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

  // Get the section parameter from the query string
  const section = req.query.section || 'full';
  
  // Validate the section parameter
  const validSections = ['full', 'building', 'compliance', 'fabric', 'special', 'energy', 'lighting', 'meters', 'exemptions'];
  if (!validSections.includes(section)) {
    return res.status(400).json({
      success: false,
      error: `Invalid section. Must be one of: ${validSections.join(', ')}`
    });
  }

  const reportService = new ReportService(project, section);
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
  try {
    const buildingTypes = buildingTypeMapping.buildingTypes.map(type => ({
      id: type.id,
      name: type.name,
      description: type.description,
      nccClassification: type.nccClassification,
      typicalUse: type.typicalUse,
      commonFeatures: type.commonFeatures,
      notes: type.notes
    }));

    res.json({
      success: true,
      data: buildingTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Error getting building types: ${error.message}`
    });
  }
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