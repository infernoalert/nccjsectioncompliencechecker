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
 *         - name
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Climate zone name
 *         description:
 *           type: string
 *           description: Climate zone description
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of climate zones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClimateZone'
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, getClimateZones);

/**
 * @swagger
 * /api/climate-zones/{id}:
 *   get:
 *     summary: Get a climate zone by ID
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
 *         description: Climate zone details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClimateZone'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Climate zone not found
 */
router.get('/:id', protect, getClimateZone);

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
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Climate zone name
 *               description:
 *                 type: string
 *                 description: Climate zone description
 *     responses:
 *       201:
 *         description: Climate zone created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to create climate zone
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Climate zone name
 *               description:
 *                 type: string
 *                 description: Climate zone description
 *     responses:
 *       200:
 *         description: Climate zone updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to update climate zone
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
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to delete climate zone
 *       404:
 *         description: Climate zone not found
 */
router.delete('/:id', protect, authorize('admin'), deleteClimateZone);

module.exports = router; 