const Project = require('../models/Project');
const BuildingClassification = require('../models/BuildingClassification');
const ClimateZone = require('../models/ClimateZone');
const asyncHandler = require('express-async-handler');
const complianceService = require('../services/complianceService');
const buildingTypeMapping = require('../data/mappings/buildingTypeToClassification.json');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .populate('buildingClassification')
      .populate('climateZone')
      .populate('compliancePathway')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('buildingClassification')
      .populate('climateZone')
      .populate('buildingFabric')
      .populate('compliancePathway')
      .populate('specialRequirements');

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

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  try {
    console.log('Creating project with data:', req.body);
    console.log('User ID:', req.user.id);
    
    // Find building type mapping from the buildingTypes array
    const buildingType = buildingTypeMapping.buildingTypes.find(type => type.id === req.body.buildingType);
    if (!buildingType) {
      return res.status(400).json({
        success: false,
        error: 'Invalid building type'
      });
    }

    // Find corresponding building classification
    const nccClass = `Class_${buildingType.nccClassification}`;
    const buildingClass = await BuildingClassification.findOne({ classType: nccClass });
    if (!buildingClass) {
      return res.status(400).json({
        success: false,
        error: `Building classification not found for type ${nccClass}`
      });
    }

    // Create project with automatically assigned classification
    const project = new Project({
      ...req.body,
      buildingClassification: buildingClass._id,
      owner: req.user.id
    });

    const savedProject = await project.save();
    
    // Populate the saved project with related data
    const populatedProject = await Project.findById(savedProject._id)
      .populate('buildingClassification')
      .populate('climateZone')
      .populate('compliancePathway');
    
    res.status(201).json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
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

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
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

    await Project.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      success: true,
      data: {} 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
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

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  checkCompliance
}; 