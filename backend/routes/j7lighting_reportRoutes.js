const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateJ7LightingReport } = require('../controllers/j7lighting_reportController');

/**
 * @swagger
 * /api/j7lighting/{id}/report:
 *   get:
 *     summary: Generate J7 Lighting & Power compliance report for a project
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

// Generate J7 Lighting & Power report
router.get('/:id/report', protect, generateJ7LightingReport);

module.exports = router; 