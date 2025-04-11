const express = require('express');
const router = express.Router();
const {
  getCompliancePathways,
  getCompliancePathway,
  createCompliancePathway,
  updateCompliancePathway,
  deleteCompliancePathway
} = require('../controllers/compliancePathwayController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCompliancePathways);
router.get('/:id', getCompliancePathway);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createCompliancePathway);
router.put('/:id', protect, authorize('admin'), updateCompliancePathway);
router.delete('/:id', protect, authorize('admin'), deleteCompliancePathway);

module.exports = router; 