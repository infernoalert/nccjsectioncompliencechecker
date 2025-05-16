const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateEnergyMonitorReport } = require('../controllers/energy_monitor_reportController');

/**
 * @swagger
 * /api/j9monitor/{id}/report:
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
 *       - in: query
 *         name: sectionType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [j9monitor, elemental-provisions, energy-efficiency, fire-safety]
 *         description: Type of section to generate report for
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
router.get('/:id/report', protect, generateEnergyMonitorReport);

module.exports = router; 