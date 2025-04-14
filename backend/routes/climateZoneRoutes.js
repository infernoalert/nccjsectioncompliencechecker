const express = require('express');
const router = express.Router();
const {
  getClimateZones,
  getClimateZone,
  createClimateZone,
  updateClimateZone,
  deleteClimateZone
} = require('../controllers/climateZoneController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ClimateZone:
 *       type: object
 *       required:
 *         - zone
 *         - locations
 *         - description
 *         - insulation
 *         - wallRValue
 *         - roofRValue
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         zone:
 *           type: number
 *           minimum: 1
 *           maximum: 8
 *           description: Climate zone number (1-8)
 *         locations:
 *           type: array
 *           items:
 *             type: string
 *           description: List of locations in this climate zone
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Climate zone description
 *         insulation:
 *           type: string
 *           enum: [standard, enhanced]
 *           description: Insulation type required
 *         wallRValue:
 *           type: string
 *           description: Required wall R-value
 *         roofRValue:
 *           type: string
 *           description: Required roof R-value
 *         glazing:
 *           type: object
 *           description: Glazing requirements
 *         hvac:
 *           type: object
 *           description: HVAC requirements
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
 * /api/climate-zones:
 *   get:
 *     summary: Get all climate zones
 *     tags: [Climate Zones]
 *     responses:
 *       200:
 *         description: List of climate zones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClimateZone'
 */
router.get('/', getClimateZones);

/**
 * @swagger
 * /api/climate-zones/{id}:
 *   get:
 *     summary: Get a climate zone by ID
 *     tags: [Climate Zones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Climate zone ID
 *     responses:
 *       200:
 *         description: Climate zone details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClimateZone'
 *       404:
 *         description: Climate zone not found
 */
router.get('/:id', getClimateZone);

/**
 * @swagger
 * /api/climate-zones:
 *   post:
 *     summary: Create a new climate zone
 *     tags: [Climate Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClimateZone'
 *     responses:
 *       201:
 *         description: Climate zone created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClimateZone'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, authorize('admin'), createClimateZone);

/**
 * @swagger
 * /api/climate-zones/{id}:
 *   put:
 *     summary: Update a climate zone
 *     tags: [Climate Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Climate zone ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClimateZone'
 *     responses:
 *       200:
 *         description: Climate zone updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClimateZone'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Climate zone not found
 */
router.put('/:id', protect, authorize('admin'), updateClimateZone);

/**
 * @swagger
 * /api/climate-zones/{id}:
 *   delete:
 *     summary: Delete a climate zone
 *     tags: [Climate Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Climate zone ID
 *     responses:
 *       200:
 *         description: Climate zone deleted successfully
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
 *         description: Climate zone not found
 */
router.delete('/:id', protect, authorize('admin'), deleteClimateZone);

module.exports = router; 