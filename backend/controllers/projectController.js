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
const buildingTypeMapping = require('../data/mappings/buildingTypeToClassification.json');
const { getAllLocations, getClimateZoneForLocation } = require('../utils/locationUtils');
const ReportService = require('../services/reportService');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .populate('climateZone')
      .populate('buildingFabric')
      .populate('specialRequirements')
      .populate('compliancePathway');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id
    })
      .populate('climateZone')
      .populate('buildingFabric')
      .populate('specialRequirements')
      .populate('compliancePathway');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  try {
    const { error } = validateProject(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, buildingType, location, floorArea } = req.body;

    // Get climate zone based on location
    const climateZone = await getClimateZoneByLocation(location);
    if (!climateZone) {
      return res.status(400).json({ message: 'Invalid location or climate zone not found' });
    }

    const project = new Project({
      name,
      description,
      owner: req.user.id,
      buildingType,
      location,
      floorArea,
      climateZone: climateZone._id
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  try {
    const { error } = validateProject(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { name, description, buildingType, location, floorArea } = req.body;

    // Update climate zone if location changes
    if (location && location !== project.location) {
      const climateZone = await getClimateZoneByLocation(location);
      if (!climateZone) {
        return res.status(400).json({ message: 'Invalid location or climate zone not found' });
      }
      project.climateZone = climateZone._id;
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.buildingType = buildingType || project.buildingType;
    project.location = location || project.location;
    project.floorArea = floorArea || project.floorArea;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Check compliance for a project
// @route   POST /api/projects/:id/check-compliance
// @access  Private
const checkCompliance = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @desc    Generate a compliance report for a project
// @route   GET /api/projects/:id/report
// @access  Private
const generateReport = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('buildingFabric');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    const reportService = new ReportService(project);
    const report = await reportService.generateReport();

    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

const getBuildingTypes = async (req, res) => {
  try {
    const buildingTypes = buildingTypeMapping.buildingTypes;
    res.status(200).json({
      success: true,
      data: buildingTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getLocations = async (req, res) => {
  try {
    const locations = getAllLocations();
    res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  checkCompliance,
  getBuildingTypes,
  getLocations,
  generateReport
}; 