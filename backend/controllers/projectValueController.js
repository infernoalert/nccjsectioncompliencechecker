const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const { validateProjectValue } = require('../utils/validation');

// @desc    Get all values for a project
// @route   GET /api/projects/:projectId/values
// @access  Private
exports.getProjectValues = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user owns the project or is an admin
  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this project'
    });
  }

  res.status(200).json({
    success: true,
    data: project.electrical.energyMonitoring
  });
});

// @desc    Get a specific value
// @route   GET /api/projects/:projectId/values/:valueId
// @access  Private
exports.getProjectValue = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user owns the project or is an admin
  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this project'
    });
  }

  const value = project.electrical.energyMonitoring.id(req.params.valueId);
  
  if (!value) {
    return res.status(404).json({
      success: false,
      error: 'Value not found'
    });
  }

  res.status(200).json({
    success: true,
    data: value
  });
});

// @desc    Create a new value
// @route   POST /api/projects/:projectId/values
// @access  Private
exports.createProjectValue = asyncHandler(async (req, res) => {
  const { error } = validateProjectValue(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  const project = await Project.findById(req.params.projectId);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user owns the project or is an admin
  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to modify this project'
    });
  }

  // Check if a value with the same part number already exists
  const existingValue = project.electrical.energyMonitoring.find(
    v => v.partNumber === req.body.partNumber
  );

  if (existingValue) {
    return res.status(400).json({
      success: false,
      error: 'A value with this part number already exists'
    });
  }

  project.electrical.energyMonitoring.push(req.body);
  await project.save();

  res.status(201).json({
    success: true,
    data: project.electrical.energyMonitoring[project.electrical.energyMonitoring.length - 1]
  });
});

// @desc    Update a value
// @route   PUT /api/projects/:projectId/values/:valueId
// @access  Private
exports.updateProjectValue = asyncHandler(async (req, res) => {
  const { error } = validateProjectValue(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  const project = await Project.findById(req.params.projectId);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user owns the project or is an admin
  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to modify this project'
    });
  }

  const value = project.electrical.energyMonitoring.id(req.params.valueId);
  
  if (!value) {
    return res.status(404).json({
      success: false,
      error: 'Value not found'
    });
  }

  // Check if updating part number would create a duplicate
  if (req.body.partNumber && req.body.partNumber !== value.partNumber) {
    const duplicateValue = project.electrical.energyMonitoring.find(
      v => v.partNumber === req.body.partNumber
    );

    if (duplicateValue) {
      return res.status(400).json({
        success: false,
        error: 'A value with this part number already exists'
      });
    }
  }

  Object.assign(value, req.body);
  await project.save();

  res.status(200).json({
    success: true,
    data: value
  });
});

// @desc    Delete a value
// @route   DELETE /api/projects/:projectId/values/:valueId
// @access  Private
exports.deleteProjectValue = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user owns the project or is an admin
  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to modify this project'
    });
  }

  const value = project.electrical.energyMonitoring.id(req.params.valueId);
  
  if (!value) {
    return res.status(404).json({
      success: false,
      error: 'Value not found'
    });
  }

  value.remove();
  await project.save();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 