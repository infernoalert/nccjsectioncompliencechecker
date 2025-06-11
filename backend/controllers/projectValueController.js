const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const { validateProjectValue } = require('../utils/validation');
const { model: EnergyMonitoring } = require('../models/EnergyMonitoring');
const { model: Load } = require('../models/Load');

// @desc    Get all values for a project
// @route   GET /api/projects/:projectId/values
// @access  Private
exports.getProjectValues = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId)
    .populate('electrical.loads')
    .populate('electrical.energyMonitoring');
  
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
    ...(project.electrical?.loads || []).map(load => {
      const loadObj = load.toObject();
      console.log('Load object:', { 
        id: loadObj._id ? loadObj._id.toString() : 'no-id', 
        name: loadObj.name 
      });
      return { ...loadObj, type: 'load' };
    }),
    ...(project.electrical?.energyMonitoring || []).map(monitor => {
      const monitorObj = monitor.toObject();
      console.log('Monitor object:', { 
        id: monitorObj._id ? monitorObj._id.toString() : 'no-id', 
        label: monitorObj.label 
      });
      return { ...monitorObj, type: 'monitoring' };
    })
  ];

  console.log('Returning values:', values);

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
  console.log('Received request body:', req.body);
  const { error } = validateProjectValue(req.body);
  if (error) {
    console.log('Validation error:', error.details);
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

  const { type, refId } = req.body;

  if (type === 'load') {
    project.electrical.loads.push(refId);
    await project.save();
    res.status(201).json({
      success: true,
      data: { _id: refId, type: 'load' }
    });
  } else if (type === 'monitoring') {
    project.electrical.energyMonitoring.push(refId);
    await project.save();
    res.status(201).json({
      success: true,
      data: { _id: refId, type: 'monitoring' }
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

  // Prevent update if label or panel is missing
  if (data.label === undefined || data.panel === undefined || !data.label || !data.panel) {
    return res.status(400).json({
      success: false,
      error: 'Label and panel are required for energy monitoring devices.'
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

  // Validate valueId
  if (!req.params.valueId || req.params.valueId === 'undefined') {
    return res.status(400).json({
      success: false,
      error: 'Invalid value ID'
    });
  }

  // Try to find and remove from both arrays
  const loadIndex = project.electrical?.loads?.findIndex(l => l._id && l._id.toString() === req.params.valueId);
  const monitorIndex = project.electrical?.energyMonitoring?.findIndex(m => m._id && m._id.toString() === req.params.valueId);

  console.log('Deleting value:', {
    valueId: req.params.valueId,
    loadIndex,
    monitorIndex,
    loads: project.electrical?.loads?.map(l => ({ 
      id: l._id ? l._id.toString() : 'no-id', 
      name: l.name 
    })),
    monitors: project.electrical?.energyMonitoring?.map(m => ({ 
      id: m._id ? m._id.toString() : 'no-id', 
      deviceId: m.deviceId 
    }))
  });

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
    // Remove any devices with null/empty label or panel
    project.electrical.energyMonitoring = project.electrical.energyMonitoring.filter(m => m.label && m.panel);
  }

  await project.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.createEnergyMonitoring = asyncHandler(async (req, res) => {
  const { label, panel, monitoringDeviceType, description, connection } = req.body;
  if (!label || !panel || !monitoringDeviceType) {
    return res.status(400).json({
      success: false,
      error: 'Label, panel, and monitoringDeviceType are required.'
    });
  }
  const device = await EnergyMonitoring.create({
    label,
    panel,
    monitoringDeviceType,
    description: description || '',
    connection: connection || '',
    status: 'active',
    lastUpdated: new Date()
  });
  res.status(201).json({ success: true, data: device });
});

exports.createLoad = asyncHandler(async (req, res) => {
  const { name, powerRating, voltage, current } = req.body;
  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Name is required.'
    });
  }
  const load = await Load.create({
    name,
    powerRating: powerRating || 0,
    voltage: voltage || 0,
    current: current || 0
  });
  res.status(201).json({ success: true, data: load });
}); 