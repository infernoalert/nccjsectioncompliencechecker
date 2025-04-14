const ClimateZone = require('../models/ClimateZone');
const asyncHandler = require('express-async-handler');

// @desc    Get all climate zones
// @route   GET /api/climatezones
// @access  Public
const getClimateZones = asyncHandler(async (req, res) => {
  const climateZones = await ClimateZone.find();
  res.json(climateZones);
});

// @desc    Get single climate zone
// @route   GET /api/climatezones/:id
// @access  Public
const getClimateZone = asyncHandler(async (req, res) => {
  const climateZone = await ClimateZone.findById(req.params.id);
  
  if (!climateZone) {
    res.status(404);
    throw new Error('Climate zone not found');
  }

  res.json(climateZone);
});

// @desc    Create a climate zone
// @route   POST /api/climate-zones
// @access  Private/Admin
const createClimateZone = asyncHandler(async (req, res) => {
  const climateZone = await ClimateZone.create(req.body);
  res.status(201).json(climateZone);
});

// @desc    Update a climate zone
// @route   PUT /api/climate-zones/:id
// @access  Private/Admin
const updateClimateZone = asyncHandler(async (req, res) => {
  const climateZone = await ClimateZone.findById(req.params.id);
  
  if (!climateZone) {
    res.status(404);
    throw new Error('Climate zone not found');
  }
  
  const updatedClimateZone = await ClimateZone.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json(updatedClimateZone);
});

// @desc    Delete a climate zone
// @route   DELETE /api/climate-zones/:id
// @access  Private/Admin
const deleteClimateZone = asyncHandler(async (req, res) => {
  const climateZone = await ClimateZone.findById(req.params.id);
  
  if (!climateZone) {
    res.status(404);
    throw new Error('Climate zone not found');
  }
  
  await climateZone.remove();
  
  res.status(200).json({ message: 'Climate zone removed' });
});

module.exports = {
  getClimateZones,
  getClimateZone,
  createClimateZone,
  updateClimateZone,
  deleteClimateZone
}; 