const BuildingClass = require('../models/BuildingClass');
const asyncHandler = require('express-async-handler');

// @desc    Get all building classes
// @route   GET /api/building-classes
// @access  Public
const getBuildingClasses = asyncHandler(async (req, res) => {
  const buildingClasses = await BuildingClass.find({});
  res.status(200).json(buildingClasses);
});

// @desc    Get a single building class
// @route   GET /api/building-classes/:id
// @access  Public
const getBuildingClass = asyncHandler(async (req, res) => {
  const buildingClass = await BuildingClass.findById(req.params.id);
  
  if (!buildingClass) {
    res.status(404);
    throw new Error('Building class not found');
  }
  
  res.status(200).json(buildingClass);
});

// @desc    Create a building class
// @route   POST /api/building-classes
// @access  Private/Admin
const createBuildingClass = asyncHandler(async (req, res) => {
  const buildingClass = await BuildingClass.create(req.body);
  res.status(201).json(buildingClass);
});

// @desc    Update a building class
// @route   PUT /api/building-classes/:id
// @access  Private/Admin
const updateBuildingClass = asyncHandler(async (req, res) => {
  const buildingClass = await BuildingClass.findById(req.params.id);
  
  if (!buildingClass) {
    res.status(404);
    throw new Error('Building class not found');
  }
  
  const updatedBuildingClass = await BuildingClass.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json(updatedBuildingClass);
});

// @desc    Delete a building class
// @route   DELETE /api/building-classes/:id
// @access  Private/Admin
const deleteBuildingClass = asyncHandler(async (req, res) => {
  const buildingClass = await BuildingClass.findById(req.params.id);
  
  if (!buildingClass) {
    res.status(404);
    throw new Error('Building class not found');
  }
  
  await buildingClass.remove();
  
  res.status(200).json({ message: 'Building class removed' });
});

// @desc    Get climate zone requirements for a building class
// @route   GET /api/building-classes/:id/climate-zone/:zone
// @access  Public
const getClimateZoneRequirements = asyncHandler(async (req, res) => {
  const buildingClass = await BuildingClass.findById(req.params.id);
  
  if (!buildingClass) {
    res.status(404);
    throw new Error('Building class not found');
  }
  
  const climateZoneRequirements = buildingClass.climateZoneRequirements.find(
    req => req.zone === req.params.zone
  );
  
  if (!climateZoneRequirements) {
    res.status(404);
    throw new Error('Climate zone requirements not found');
  }
  
  res.status(200).json(climateZoneRequirements);
});

module.exports = {
  getBuildingClasses,
  getBuildingClass,
  createBuildingClass,
  updateBuildingClass,
  deleteBuildingClass,
  getClimateZoneRequirements
}; 