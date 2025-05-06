const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  checkCompliance,
  generateReport
} = require('../controllers/projectController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - buildingType
 *         - location
 *         - floorArea
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Project name
 *         buildingType:
 *           type: string
 *           description: Type of building
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             state:
 *               type: string
 *             postcode:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *         floorArea:
 *           type: number
 *           description: Total floor area in square meters
 *         buildingClassification:
 *           type: object
 *           properties:
 *             classification:
 *               type: string
 *             description:
 *               type: string
 *             typicalUse:
 *               type: string
 *             commonFeatures:
 *               type: array
 *               items:
 *                 type: string
 *             notes:
 *               type: string
 *         climateZone:
 *           type: string
 *           description: Climate zone reference
 *         buildingFabric:
 *           type: object
 *           properties:
 *             walls:
 *               type: object
 *             roof:
 *               type: object
 *             floor:
 *               type: object
 *             windows:
 *               type: object
 *         specialRequirements:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               reference:
 *                 type: string
 *               notes:
 *                 type: string
 */

// @route   GET /api/projects
// @desc    Get all projects for a user
// @access  Private
router.get('/', protect, getProjects);

// @route   GET /api/projects/:id
// @desc    Get a single project
// @access  Private
router.get('/:id', protect, getProject);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', protect, createProject);

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', protect, updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', protect, deleteProject);

// @route   POST /api/projects/:id/check-compliance
// @desc    Check compliance for a project
// @access  Private
router.post('/:id/check-compliance', protect, checkCompliance);

// @route   GET /api/projects/:id/report
// @desc    Generate a compliance report for a project
// @access  Private
router.get('/:id/report', protect, generateReport);

module.exports = router; 