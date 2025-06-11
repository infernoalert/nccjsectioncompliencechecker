const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProjectValues,
  getProjectValue,
  createProjectValue,
  updateProjectValue,
  deleteProjectValue,
  createEnergyMonitoring,
  createLoad
} = require('../controllers/projectValueController');

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectValue:
 *       type: object
 *       required:
 *         - systemType
 *         - name
 *         - partNumber
 *       properties:
 *         systemType:
 *           type: string
 *           description: Type of the monitoring system
 *         name:
 *           type: string
 *           description: Name of the value/meter
 *         partNumber:
 *           type: string
 *           description: Unique part number
 *         description:
 *           type: string
 *           description: Description of the value/meter
 *         manufacturer:
 *           type: string
 *           description: Manufacturer name
 *         specifications:
 *           type: object
 *           description: Technical specifications
 *         status:
 *           type: string
 *           enum: [active, inactive, maintenance]
 *           default: active
 *           description: Current status of the value/meter
 *         connectedLoads:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of connected load IDs
 */

/**
 * @swagger
 * /api/projects/{projectId}/values:
 *   get:
 *     summary: Get all values for a project
 *     tags: [Project Values]
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
 *         description: List of project values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectValue'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 */
router.get('/:projectId/values', protect, getProjectValues);

/**
 * @swagger
 * /api/projects/{projectId}/values/{valueId}:
 *   get:
 *     summary: Get a specific value
 *     tags: [Project Values]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Value ID
 *     responses:
 *       200:
 *         description: Project value details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProjectValue'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project or value not found
 */
router.get('/:projectId/values/:valueId', protect, getProjectValue);

/**
 * @swagger
 * /api/projects/{projectId}/values:
 *   post:
 *     summary: Create a new value
 *     tags: [Project Values]
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
 *             $ref: '#/components/schemas/ProjectValue'
 *     responses:
 *       201:
 *         description: Value created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProjectValue'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 */
router.post('/:projectId/values', protect, createProjectValue);

/**
 * @swagger
 * /api/projects/{projectId}/values/{valueId}:
 *   put:
 *     summary: Update a value
 *     tags: [Project Values]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Value ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectValue'
 *     responses:
 *       200:
 *         description: Value updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProjectValue'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project or value not found
 */
router.put('/:projectId/values/:valueId', protect, updateProjectValue);

/**
 * @swagger
 * /api/projects/{projectId}/values/{valueId}:
 *   delete:
 *     summary: Delete a value
 *     tags: [Project Values]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Value ID
 *     responses:
 *       200:
 *         description: Value deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project or value not found
 */
router.delete('/:projectId/values/:valueId', protect, deleteProjectValue);

// Add routes for creating referenced documents
router.post('/energy-monitoring', protect, createEnergyMonitoring);
router.post('/load', protect, createLoad);

module.exports = router; 