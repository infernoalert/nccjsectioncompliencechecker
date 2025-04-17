const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ComplianceCalculationRequest:
 *       type: object
 *       required:
 *         - buildingClass
 *         - climateZone
 *         - floorArea
 *       properties:
 *         buildingClass:
 *           type: string
 *           description: ID of the building class
 *         climateZone:
 *           type: string
 *           description: ID of the climate zone
 *         floorArea:
 *           type: number
 *           description: Total floor area in square meters
 *     
 *     ComplianceResult:
 *       type: object
 *       properties:
 *         isCompliant:
 *           type: boolean
 *           description: Whether the building meets compliance requirements
 *         requirements:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               section:
 *                 type: string
 *                 description: NCC section reference
 *               requirement:
 *                 type: string
 *                 description: Specific requirement description
 *               isMet:
 *                 type: boolean
 *                 description: Whether this requirement is met
 *               details:
 *                 type: string
 *                 description: Additional details or calculations
 */

/**
 * @swagger
 * /api/calculate-compliance:
 *   post:
 *     summary: Calculate building compliance based on class, climate zone, and floor area
 *     tags: [Compliance Calculator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComplianceCalculationRequest'
 *     responses:
 *       200:
 *         description: Compliance calculation results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComplianceResult'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Building class or climate zone not found
 */
router.post('/calculate-compliance', protect, async (req, res) => {
  // TODO: Implement compliance calculation logic
  res.status(501).json({ message: 'Not implemented yet' });
});

/**
 * @swagger
 * /api/special-requirements:
 *   get:
 *     summary: Get all special requirements
 *     tags: [Special Requirements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of special requirements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the requirement
 *                   name:
 *                     type: string
 *                     description: Name of the requirement
 *                   trigger:
 *                     type: string
 *                     description: Condition that triggers this requirement
 *                   requirements:
 *                     type: object
 *                     description: Detailed requirements
 *                   conditions:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Conditions under which this requirement applies
 *                   exemptions:
 *                     type: object
 *                     description: Possible exemptions from this requirement
 *       401:
 *         description: Not authorized
 */
router.get('/special-requirements', protect, async (req, res) => {
  try {
    const specialRequirementsData = await getSection('special-requirements');
    if (!specialRequirementsData || !specialRequirementsData.special_requirements) {
      return res.status(404).json({
        success: false,
        error: 'Special requirements not found'
      });
    }

    const requirements = Object.entries(specialRequirementsData.special_requirements)
      .map(([key, requirement]) => ({
        id: key,
        ...requirement
      }));

    res.json({
      success: true,
      data: requirements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/special-requirements/{type}:
 *   get:
 *     summary: Get special requirements by type
 *     tags: [Special Requirements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of special requirement
 *     responses:
 *       200:
 *         description: Special requirements for the specified type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the requirement
 *                 name:
 *                   type: string
 *                   description: Name of the requirement
 *                 trigger:
 *                   type: string
 *                   description: Condition that triggers this requirement
 *                 requirements:
 *                   type: object
 *                   description: Detailed requirements
 *                 conditions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Conditions under which this requirement applies
 *                 exemptions:
 *                   type: object
 *                   description: Possible exemptions from this requirement
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Special requirement type not found
 */
router.get('/special-requirements/:type', protect, async (req, res) => {
  try {
    const specialRequirementsData = await getSection('special-requirements');
    if (!specialRequirementsData || !specialRequirementsData.special_requirements) {
      return res.status(404).json({
        success: false,
        error: 'Special requirements not found'
      });
    }

    const requirement = specialRequirementsData.special_requirements[req.params.type];
    if (!requirement) {
      return res.status(404).json({
        success: false,
        error: `Special requirement type '${req.params.type}' not found`
      });
    }

    res.json({
      success: true,
      data: {
        id: req.params.type,
        ...requirement
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 