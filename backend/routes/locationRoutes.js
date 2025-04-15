const express = require('express');
const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getClimateZones,
  getClimateZone,
  getLocationClimateZone
} = require('../controllers/locationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Re-route into other resource routers
router.use('/:locationId/climate-zone', getLocationClimateZone);

router
  .route('/')
  .get(getLocations)
  .post(protect, authorize('admin'), createLocation);

router
  .route('/:id')
  .get(getLocation)
  .put(protect, authorize('admin'), updateLocation)
  .delete(protect, authorize('admin'), deleteLocation);

router
  .route('/climate-zones')
  .get(getClimateZones);

router
  .route('/climate-zones/:id')
  .get(getClimateZone);

module.exports = router; 