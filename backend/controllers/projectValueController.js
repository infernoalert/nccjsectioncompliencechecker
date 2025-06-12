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
    .populate({ path: 'electrical.energyMonitoring', model: 'EnergyMonitoring' })
    .populate({ path: 'electrical.loads', model: 'Load' });
  
  console.log('Fetched project.electrical.energyMonitoring:', project.electrical.energyMonitoring);
  
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
      console.log('Load object:', { 
        id: load._id ? load._id.toString() : 'no-id', 
        name: load.name 
      });
      return { ...load.toObject(), type: 'load' };
    }),
    ...(project.electrical?.energyMonitoring || []).map(monitor => {
      console.log('Monitor object:', { 
        id: monitor._id ? monitor._id.toString() : 'no-id', 
        label: monitor.label 
      });
      return { ...monitor.toObject(), type: 'monitoring' };
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

  if (type === 'load') {
    // Update Load document directly
    const updatedLoad = await Load.findByIdAndUpdate(
      req.params.valueId,
      data,
      { new: true, runValidators: true }
    );
    
    if (!updatedLoad) {
      return res.status(404).json({
        success: false,
        error: 'Load not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { ...updatedLoad.toObject(), type: 'load' }
    });
  } else if (type === 'monitoring') {
    // Prevent update if label or panel is missing
    if (!data.label || !data.panel) {
      return res.status(400).json({
        success: false,
        error: 'Label and panel are required for energy monitoring devices.'
      });
    }

    // Update EnergyMonitoring document directly
    const updatedMonitoring = await EnergyMonitoring.findByIdAndUpdate(
      req.params.valueId,
      data,
      { new: true, runValidators: true }
    );
    
    if (!updatedMonitoring) {
      return res.status(404).json({
        success: false,
        error: 'Energy monitoring device not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { ...updatedMonitoring.toObject(), type: 'monitoring' }
    });
  } else {
    return res.status(400).json({
      success: false,
      error: 'Invalid type specified'
    });
  }
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

  const valueId = req.params.valueId;

  // Check if it's a load
  const loadExists = await Load.findById(valueId);
  if (loadExists) {
    // Delete the Load document
    await Load.findByIdAndDelete(valueId);
    
    // Remove from project's loads array
    project.electrical.loads = project.electrical.loads.filter(
      id => id.toString() !== valueId
    );
    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Load deleted successfully'
    });
  }

  // Check if it's an energy monitoring device
  const monitoringExists = await EnergyMonitoring.findById(valueId);
  if (monitoringExists) {
    // Delete the EnergyMonitoring document
    await EnergyMonitoring.findByIdAndDelete(valueId);
    
    // Remove from project's energyMonitoring array
    project.electrical.energyMonitoring = project.electrical.energyMonitoring.filter(
      id => id.toString() !== valueId
    );
    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Energy monitoring device deleted successfully'
    });
  }

  // If neither found
  return res.status(404).json({
    success: false,
    error: 'Value not found'
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