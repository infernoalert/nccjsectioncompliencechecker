const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateLightingPowerReport } = require('../controllers/lighting_power_reportController');

/**
 * @swagger
 * /api/lighting-power/{id}/report:
 *   get:
 *     summary: Generate lighting & power compliance report for a project
 *     tags: [Lighting & Power]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Report generated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */

// Generate lighting & power report
router.get('/:id/report', protect, generateLightingPowerReport);

module.exports = router; 