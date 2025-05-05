const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Returns a welcome message
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: A welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to the example route
 */
router.get('/example', (req, res) => {
  res.json({ message: 'Welcome to the example route' });
});

module.exports = router; 