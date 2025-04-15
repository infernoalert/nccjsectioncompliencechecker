const Location = require('../models/Location');
const ClimateZone = require('../models/ClimateZone');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
exports.getLocations = asyncHandler(async (req, res, next) => {
  const locations = await Location.find().populate('climateZone');
  
  res.status(200).json({
    success: true,
    count: locations.length,
    data: locations
  });
});

// @desc    Get single location
// @route   GET /api/locations/:id
// @access  Public
exports.getLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id).populate('climateZone');
  
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: location
  });
});

// @desc    Create new location
// @route   POST /api/locations
// @access  Private
exports.createLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.create(req.body);
  
  res.status(201).json({
    success: true,
    data: location
  });
});

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private
exports.updateLocation = asyncHandler(async (req, res, next) => {
  let location = await Location.findById(req.params.id);
  
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
  }
  
  location = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: location
  });
});

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private
exports.deleteLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id);
  
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
  }
  
  await location.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all climate zones
// @route   GET /api/locations/climate-zones
// @access  Public
exports.getClimateZones = asyncHandler(async (req, res, next) => {
  const climateZones = await ClimateZone.find();
  
  res.status(200).json({
    success: true,
    count: climateZones.length,
    data: climateZones
  });
});

// @desc    Get single climate zone
// @route   GET /api/locations/climate-zones/:id
// @access  Public
exports.getClimateZone = asyncHandler(async (req, res, next) => {
  const climateZone = await ClimateZone.findById(req.params.id);
  
  if (!climateZone) {
    return next(new ErrorResponse(`Climate zone not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: climateZone
  });
});

// @desc    Get climate zone for location
// @route   GET /api/locations/:id/climate-zone
// @access  Public
exports.getLocationClimateZone = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id).populate('climateZone');
  
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
  }
  
  if (!location.climateZone) {
    return next(new ErrorResponse(`Climate zone not found for location with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: location.climateZone
  });
}); 