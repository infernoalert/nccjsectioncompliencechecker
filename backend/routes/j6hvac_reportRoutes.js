const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateJ6HvacReport } = require('../controllers/j6hvac_reportController');

/**
 * @swagger
 * /api/j6hvac/{id}/report:
 *   get:
 *     summary: Generate J6 HVAC report for a project
 *     description: Generates a comprehensive J6 HVAC report based on project details and NCC Section J6 requirements
 *     tags: [J6 HVAC Reports]
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
 *           enum: [j6hvac, elemental-provisions, energy-efficiency, fire-safety]
 *         description: Type of section to generate report for
 *     responses:
 *       200:
 *         description: J6 HVAC report generated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */

// Generate J6 HVAC report
router.get('/:id/report', protect, generateJ6HvacReport);

module.exports = router; 