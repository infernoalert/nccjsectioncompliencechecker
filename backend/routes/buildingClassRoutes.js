const express = require('express');
const router = express.Router();
const {
  getBuildingClasses,
  getBuildingClass,
  createBuildingClass,
  updateBuildingClass,
  deleteBuildingClass,
  getClimateZoneRequirements
} = require('../controllers/buildingClassController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     BuildingClass:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Building class name
 *         description:
 *           type: string
 *           description: Building class description
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/building-classes:
 *   get:
 *     summary: Get all building classes
 *     tags: [Building Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of building classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BuildingClass'
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, getBuildingClasses);

/**
 * @swagger
 * /api/building-classes/{id}:
 *   get:
 *     summary: Get a building class by ID
 *     tags: [Building Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Building class ID
 *     responses:
 *       200:
 *         description: Building class details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BuildingClass'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Building class not found
 */
router.get('/:id', protect, getBuildingClass);

/**
 * @swagger
 * /api/building-classes:
 *   post:
 *     summary: Create a new building class
 *     tags: [Building Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Building class name
 *               description:
 *                 type: string
 *                 description: Building class description
 *     responses:
 *       201:
 *         description: Building class created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to create building class
 */
router.post('/', protect, authorize('admin'), createBuildingClass);

/**
 * @swagger
 * /api/building-classes/{id}:
 *   put:
 *     summary: Update a building class
 *     tags: [Building Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Building class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Building class name
 *               description:
 *                 type: string
 *                 description: Building class description
 *     responses:
 *       200:
 *         description: Building class updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to update building class
 *       404:
 *         description: Building class not found
 */
router.put('/:id', protect, authorize('admin'), updateBuildingClass);

/**
 * @swagger
 * /api/building-classes/{id}:
 *   delete:
 *     summary: Delete a building class
 *     tags: [Building Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Building class ID
 *     responses:
 *       200:
 *         description: Building class deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to delete building class
 *       404:
 *         description: Building class not found
 */
router.delete('/:id', protect, authorize('admin'), deleteBuildingClass);

module.exports = router; 