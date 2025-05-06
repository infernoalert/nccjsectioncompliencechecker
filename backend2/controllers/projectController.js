const Project = require('../models/project');
const ClimateZone = require('../models/climate-zone');
const asyncHandler = require('express-async-handler');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .populate('climateZone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('climateZone');

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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
exports.createProject = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      buildingType,
      location,
      floorArea,
      totalAreaOfHabitableRooms,
      buildingFabric,
      specialRequirements
    } = req.body;

    // Validate required fields
    if (!name || !buildingType || !location || !floorArea) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Validate climate zone
    const climateZone = await ClimateZone.findOne({ code: location.climateZone });
    if (!climateZone) {
      return res.status(400).json({
        success: false,
        error: 'Invalid climate zone'
      });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      createdBy: req.user.id,
      buildingType,
      buildingClassification: req.body.buildingClassification,
      location,
      climateZone: climateZone._id,
      floorArea,
      totalAreaOfHabitableRooms,
      buildingFabric,
      specialRequirements
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Make sure user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this project'
      });
    }

    // Update climate zone if location is changed
    if (req.body.location && req.body.location.climateZone) {
      const climateZone = await ClimateZone.findOne({ code: req.body.location.climateZone });
      if (!climateZone) {
        return res.status(400).json({
          success: false,
          error: 'Invalid climate zone'
        });
      }
      req.body.climateZone = climateZone._id;
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Make sure user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this project'
      });
    }

    await project.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Check compliance for a project
// @route   POST /api/projects/:id/check-compliance
// @access  Private
exports.checkCompliance = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Make sure user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to check compliance for this project'
      });
    }

    // TODO: Implement compliance checking logic
    const complianceResults = {
      status: 'pending',
      details: 'Compliance checking not yet implemented'
    };

    res.status(200).json({
      success: true,
      data: complianceResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Generate a compliance report for a project
// @route   GET /api/projects/:id/report
// @access  Private
exports.generateReport = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('climateZone');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Make sure user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to generate report for this project'
      });
    }

    // TODO: Implement report generation logic
    const report = {
      projectInfo: {
        name: project.name,
        description: project.description,
        buildingType: project.buildingType,
        location: project.location,
        floorArea: project.floorArea,
        climateZone: project.climateZone
      },
      status: 'pending',
      details: 'Report generation not yet implemented'
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}); 