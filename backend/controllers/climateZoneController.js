const ClimateZone = require('../models/ClimateZone');
const asyncHandler = require('express-async-handler');

// @desc    Get all climate zones
// @route   GET /api/climate-zones
// @access  Public
const getClimateZones = asyncHandler(async (req, res) => {
  const climateZones = await ClimateZone.find().sort('zone');
  res.status(200).json({
    success: true,
    count: climateZones.length,
    data: climateZones
  });
});

// @desc    Get single climate zone
// @route   GET /api/climate-zones/:id
// @access  Public
const getClimateZone = asyncHandler(async (req, res) => {
  const climateZone = await ClimateZone.findById(req.params.id);
  
  if (!climateZone) {
    res.status(404);
    throw new Error('Climate zone not found');
  }

  res.status(200).json({
    success: true,
    data: climateZone
  });
});

// @desc    Create a climate zone
// @route   POST /api/climate-zones
// @access  Private/Admin
const createClimateZone = asyncHandler(async (req, res) => {
  // Validate required fields
  const { zone, locations, description, insulation, wallRValue, roofRValue } = req.body;
  
  if (!zone || !locations || !description || !insulation || !wallRValue || !roofRValue) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const climateZone = await ClimateZone.create(req.body);
  res.status(201).json({
    success: true,
    data: climateZone
  });
});

// @desc    Update a climate zone
// @route   PUT /api/climate-zones/:id
// @access  Private/Admin
const updateClimateZone = asyncHandler(async (req, res) => {
  let climateZone = await ClimateZone.findById(req.params.id);
  
  if (!climateZone) {
    res.status(404);
    throw new Error('Climate zone not found');
  }
  
  climateZone = await ClimateZone.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: climateZone
  });
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
  
  await climateZone.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getClimateZones,
  getClimateZone,
  createClimateZone,
  updateClimateZone,
  deleteClimateZone
}; 