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

  // Combine loads and energy monitoring values
  const values = [
    ...(project.electrical?.loads || []).map(load => ({ ...load.toObject(), type: 'load' })),
    ...(project.electrical?.energyMonitoring || []).map(monitor => ({ ...monitor.toObject(), type: 'monitoring' }))
  ];

  res.status(200).json({
    success: true,
    data: values
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

  // Search in both loads and energy monitoring
  const load = project.electrical?.loads?.id(req.params.valueId);
  const monitor = project.electrical?.energyMonitoring?.id(req.params.valueId);
  
  if (!load && !monitor) {
    return res.status(404).json({
      success: false,
      error: 'Value not found'
    });
  }

  const value = load || monitor;
  res.status(200).json({
    success: true,
    data: { ...value.toObject(), type: load ? 'load' : 'monitoring' }
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

  // Initialize electrical object if it doesn't exist
  if (!project.electrical) {
    project.electrical = {
      loads: [],
      energyMonitoring: [],
      complianceStatus: 'pending',
      lastAssessmentDate: new Date()
    };
  }

  const { type, ...data } = req.body;

  // Add the new value based on type
  if (type === 'load') {
    project.electrical.loads.push(data);
    await project.save();
    res.status(201).json({
      success: true,
      data: { ...project.electrical.loads[project.electrical.loads.length - 1].toObject(), type: 'load' }
    });
  } else if (type === 'monitoring') {
    project.electrical.energyMonitoring.push({
      ...data,
      timestamp: new Date()
    });
    await project.save();
    res.status(201).json({
      success: true,
      data: { ...project.electrical.energyMonitoring[project.electrical.energyMonitoring.length - 1].toObject(), type: 'monitoring' }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid type specified'
    });
  }
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

  const { type, ...data } = req.body;
  let value;

  if (type === 'load') {
    value = project.electrical?.loads?.id(req.params.valueId);
  } else if (type === 'monitoring') {
    value = project.electrical?.energyMonitoring?.id(req.params.valueId);
  }
  
  if (!value) {
    return res.status(404).json({
      success: false,
      error: 'Value not found'
    });
  }

  Object.assign(value, data);
  await project.save();

  res.status(200).json({
    success: true,
    data: { ...value.toObject(), type }
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

  // Try to find and remove from both arrays
  const loadIndex = project.electrical?.loads?.findIndex(l => l._id.toString() === req.params.valueId);
  const monitorIndex = project.electrical?.energyMonitoring?.findIndex(m => m._id.toString() === req.params.valueId);

  if (loadIndex === -1 && monitorIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Value not found'
    });
  }

  if (loadIndex !== -1) {
    project.electrical.loads.splice(loadIndex, 1);
  } else {
    project.electrical.energyMonitoring.splice(monitorIndex, 1);
  }

  await project.save();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 