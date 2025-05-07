const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateElectricalReport } = require('../controllers/elec_reportController');

/**
 * @swagger
 * /api/electrical/{id}/report:
 *   get:
 *     summary: Generate electrical compliance report for a project
 *     tags: [Electrical]
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
 *       403:
 *         description: Forbidden - User does not have access to this project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error during report generation
 */

// Generate electrical report
router.get('/:id/report', protect, generateElectricalReport);

module.exports = router; 