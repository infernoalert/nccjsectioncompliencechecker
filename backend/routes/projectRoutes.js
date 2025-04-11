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
router.post('/', protect, async (req, res) => {
  // TODO: Implement project creation logic
  res.status(501).json({ message: 'Not implemented yet' });
});

/**
 * @swagger
 * /api/projects/{projectId}/compliance-report:
 *   get:
 *     summary: Get compliance report for a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project compliance report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComplianceReport'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 */
router.get('/:projectId/compliance-report', protect, async (req, res) => {
  // TODO: Implement compliance report generation logic
  res.status(501).json({ message: 'Not implemented yet' });
});

/**
 * @swagger
 * /api/projects/{projectId}/results:
 *   get:
 *     summary: Get detailed results for a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project detailed results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 *                 complianceReport:
 *                   $ref: '#/components/schemas/ComplianceReport'
 *                 calculations:
 *                   type: object
 *                   description: Detailed calculation results
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 */
router.get('/:projectId/results', protect, async (req, res) => {
  // TODO: Implement project results logic
  res.status(501).json({ message: 'Not implemented yet' });
});

/**
 * @swagger
 * /api/projects/{projectId}:
 *   patch:
 *     summary: Update project parameters
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Project name
 *               buildingClass:
 *                 type: string
 *                 description: ID of the building class
 *               climateZone:
 *                 type: string
 *                 description: ID of the climate zone
 *               floorArea:
 *                 type: number
 *                 description: Total floor area in square meters
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 */
router.patch('/:projectId', protect, async (req, res) => {
  // TODO: Implement project update logic
  res.status(501).json({ message: 'Not implemented yet' });
});

// All routes are protected and require authentication
router.use(protect);

// Project routes
router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

// Compliance check route
router.route('/:id/check-compliance')
  .post(checkCompliance);

module.exports = router; 