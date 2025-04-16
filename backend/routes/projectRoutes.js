const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  checkCompliance,
  getBuildingTypes,
  getLocations,
  generateReport
} = require('../controllers/projectController');
const { getAllBuildingTypes } = require('../utils/mappingUtils');

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - buildingClass
 *         - climateZone
 *         - floorArea
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Project name
 *         buildingClass:
 *           type: string
 *           description: ID of the building class
 *         climateZone:
 *           type: string
 *           description: ID of the climate zone
 *         floorArea:
 *           type: number
 *           description: Total floor area in square meters
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     ComplianceReport:
 *       type: object
 *       properties:
 *         projectInfo:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Project name
 *             description:
 *               type: string
 *               description: Project description
 *             buildingType:
 *               type: string
 *               description: Type of building
 *             location:
 *               type: string
 *               description: Project location
 *             owner:
 *               type: string
 *               description: Project owner ID
 *             floorArea:
 *               type: number
 *               description: Total floor area in square meters
 *             size:
 *               type: string
 *               description: Building size category
 *             status:
 *               type: string
 *               description: Project status
 *         buildingClassification:
 *           type: object
 *           properties:
 *             classType:
 *               type: string
 *               description: NCC building class type
 *             description:
 *               type: string
 *               description: Class description
 *             subtypes:
 *               type: array
 *               items:
 *                 type: string
 *               description: Building subtypes
 *             decisionTreeInfo:
 *               type: object
 *               description: Additional classification information from decision tree
 *         climateZone:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Climate zone name
 *             code:
 *               type: string
 *               description: Climate zone code
 *             description:
 *               type: string
 *               description: Zone description
 *             requirements:
 *               type: object
 *               description: Climate zone specific requirements
 *         compliancePathway:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Pathway name
 *             description:
 *               type: string
 *               description: Pathway description
 *             applicability:
 *               type: string
 *               description: Applicability conditions
 *             verification:
 *               type: string
 *               description: Verification method
 *             requirements:
 *               type: array
 *               items:
 *                 type: string
 *               description: Pathway requirements
 *         buildingFabric:
 *           type: object
 *           properties:
 *             walls:
 *               type: object
 *               description: Wall specifications and requirements
 *             roof:
 *               type: object
 *               description: Roof specifications and requirements
 *             floor:
 *               type: object
 *               description: Floor specifications and requirements
 *             glazing:
 *               type: object
 *               description: Glazing specifications and requirements
 *         specialRequirements:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Requirement name
 *               trigger:
 *                 type: string
 *                 description: What triggers this requirement
 *               requirements:
 *                 type: object
 *                 description: Detailed requirements
 *         complianceResults:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [compliant, non-compliant, pending]
 *               description: Overall compliance status
 *             checks:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   section:
 *                     type: string
 *                     description: Section reference
 *                   status:
 *                     type: string
 *                     enum: [pass, fail, not-applicable]
 *                   details:
 *                     type: string
 *             lastChecked:
 *               type: string
 *               format: date-time
 *             nextReviewDate:
 *               type: string
 *               format: date-time
 *         metadata:
 *           type: object
 *           properties:
 *             generatedAt:
 *               type: string
 *               format: date-time
 *               description: Report generation timestamp
 *             reportVersion:
 *               type: string
 *               description: Version of the report format
 *
 * /api/projects/{id}/report:
 *   get:
 *     summary: Generate a comprehensive compliance report for a project
 *     tags: [Projects]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 data:
 *                   $ref: '#/components/schemas/ComplianceReport'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - User does not have access to this project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error during report generation
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */

// Building types route - MUST be defined BEFORE the /:id routes
router.get('/building-types', protect, getBuildingTypes);
router.get('/locations', protect, getLocations);

// Project routes
router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

// Additional project routes
router.get('/:id/check-compliance', protect, checkCompliance);
router.get('/:id/report', protect, generateReport);

module.exports = router; 