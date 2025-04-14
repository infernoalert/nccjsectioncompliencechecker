const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  checkCompliance
} = require('../controllers/projectController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - buildingClass
 *         - climateZone
 *         - floorArea
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Project name
 *         buildingClass:
 *           type: string
 *           description: ID of the building class
 *         climateZone:
 *           type: string
 *           description: ID of the climate zone
 *         floorArea:
 *           type: number
 *           description: Total floor area in square meters
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     ComplianceReport:
 *       type: object
 *       properties:
 *         projectId:
 *           type: string
 *           description: ID of the project
 *         isCompliant:
 *           type: boolean
 *           description: Overall compliance status
 *         sections:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               section:
 *                 type: string
 *                 description: NCC section reference
 *               status:
 *                 type: string
 *                 enum: [compliant, non-compliant, not-applicable]
 *                 description: Section compliance status
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     requirement:
 *                       type: string
 *                       description: Requirement description
 *                     status:
 *                       type: string
 *                       enum: [compliant, non-compliant, not-applicable]
 *                       description: Requirement compliance status
 *                     details:
 *                       type: string
 *                       description: Additional details or calculations
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */

// Project routes
router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.post('/:id/check-compliance', protect, checkCompliance);

module.exports = router; 