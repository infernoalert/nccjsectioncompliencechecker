const express = require('express');
const router = express.Router();
const {
  generateReport,
  getReports
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getReports);

router.route('/:projectId')
  .get(protect, generateReport);

module.exports = router; 