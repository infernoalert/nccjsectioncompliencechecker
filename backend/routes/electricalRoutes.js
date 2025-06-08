const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProjectElectrical } = require('../controllers/electricalController');

/**
 * @swagger
 * /api/projects/{id}/electrical:
 *   get:
 *     summary: Get electrical data for a project
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
 *         description: Electrical data retrieved successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */

router.get('/:id/electrical', protect, getProjectElectrical);

module.exports = router; 