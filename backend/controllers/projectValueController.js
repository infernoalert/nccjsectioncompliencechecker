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
    ...(project.electrical?.loads || []).map(load => {
      const loadObj = load.toObject();
      console.log('Load object:', { id: loadObj._id.toString(), name: loadObj.name });
      return { ...loadObj, type: 'load' };
    }),
    ...(project.electrical?.energyMonitoring || []).map(monitor => {
      const monitorObj = monitor.toObject();
      console.log('Monitor object:', { id: monitorObj._id.toString(), label: monitorObj.label });
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

  // Initialize buildingFabric if it doesn't exist
  if (!project.buildingFabric) {
    project.buildingFabric = {
      walls: {
        external: {
          rValueByZone: new Map([
            ['zone1', 0],
            ['zone2', 0],
            ['zone3', 0],
            ['zone4', 0],
            ['zone5', 0],
            ['zone6', 0],
            ['zone7', 0],
            ['zone8', 0]
          ]),
          thermalBreaks: {
            metalFramed: false
          }
        }
      },
      roof: {
        rValueByZone: new Map([
          ['zone1', 0],
          ['zone2', 0],
          ['zone3', 0],
          ['zone4', 0],
          ['zone5', 0],
          ['zone6', 0],
          ['zone7', 0],
          ['zone8', 0]
        ]),
        solarAbsorptance: {
          max: 0.7,
          exemptZones: []
        },
        area: 0
      },
      floor: {
        rValueByZone: new Map([
          ['zone1', 0],
          ['zone2', 0],
          ['zone3', 0],
          ['zone4', 0],
          ['zone5', 0],
          ['zone6', 0],
          ['zone7', 0],
          ['zone8', 0]
        ]),
        area: 0
      },
      glazing: {
        external: {
          uValueByZone: new Map([
            ['zone1', 0],
            ['zone2', 0],
            ['zone3', 0],
            ['zone4', 0],
            ['zone5', 0],
            ['zone6', 0],
            ['zone7', 0],
            ['zone8', 0]
          ]),
          shgcByZone: new Map([
            ['zone1', 0],
            ['zone2', 0],
            ['zone3', 0],
            ['zone4', 0],
            ['zone5', 0],
            ['zone6', 0],
            ['zone7', 0],
            ['zone8', 0]
          ]),
          area: 0
        }
      }
    };
  }

  // Initialize mcp if it doesn't exist
  if (!project.mcp) {
    project.mcp = {
      currentStep: 'initial',
      lastUpdated: new Date(),
      history: [],
      analysisResults: {
        status: 'pending',
        results: [],
        timestamp: new Date()
      },
      processingStatus: 'pending'
    };
  }

  const { type, ...data } = req.body;

  // Add the new value based on type
  if (type === 'load') {
    const newLoad = {
      name: data.name,
      powerRating: data.powerRating || 0,
      voltage: data.voltage || 0,
      current: data.current || 0
    };
    project.electrical.loads.push(newLoad);
    await project.save();
    const savedLoad = project.electrical.loads[project.electrical.loads.length - 1];
    res.status(201).json({
      success: true,
      data: { ...savedLoad.toObject(), type: 'load' }
    });
  } else if (type === 'monitoring' || ['smart meter', 'energy meter', 'power meter', 'current transformer', 'voltage transformer'].includes(type)) {
    const newMonitor = {
      label: data.label,
      panel: data.panel,
      type: type === 'monitoring' ? data.type : type, // Use the type directly if it's a device type
      description: data.description || '',
      connection: data.connection || ''
    };
    project.electrical.energyMonitoring.push(newMonitor);
    await project.save();
    const savedMonitor = project.electrical.energyMonitoring[project.electrical.energyMonitoring.length - 1];
    res.status(201).json({
      success: true,
      data: { ...savedMonitor.toObject(), type: 'monitoring' }
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

  console.log('Deleting value:', {
    valueId: req.params.valueId,
    loadIndex,
    monitorIndex,
    loads: project.electrical?.loads?.map(l => ({ id: l._id.toString(), name: l.name })),
    monitors: project.electrical?.energyMonitoring?.map(m => ({ id: m._id.toString(), deviceId: m.deviceId }))
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
  }

  await project.save();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 