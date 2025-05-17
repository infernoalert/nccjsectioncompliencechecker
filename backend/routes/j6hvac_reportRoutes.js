const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateJ6hvacReport } = require('../controllers/j6hvac_reportController');

/**
 * @swagger
 * /api/j6hvac/{id}/report:
 *   get:
 *     summary: Generate J6 HVAC compliance report for a project
 *     tags: [HVAC]
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
 *         name: section
 *         required: false
 *         schema:
 *           type: string
 *         description: Section to generate report for
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

// Generate J6 HVAC report
router.get('/:id/report', protect, generateJ6hvacReport);

module.exports = router; 