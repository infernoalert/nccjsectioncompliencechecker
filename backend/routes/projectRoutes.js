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
} = require('../controllers/elemental_provision_controller');
const {
  uploadFile,
  getFile,
  deleteFile
} = require('../controllers/fileController');
const { getAllBuildingTypes } = require('../utils/mappingUtils');

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - buildingType
 *         - location
 *         - floorArea
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Project name
 *         buildingType:
 *           type: string
 *           description: Type of building
 *         location:
 *           type: string
 *           description: Project location
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
 *             typicalUse:
 *               type: string
 *               description: Typical use of this building class
 *             commonFeatures:
 *               type: array
 *               items:
 *                 type: string
 *               description: Common features of this building class
 *             notes:
 *               type: string
 *               description: Additional notes
 *         climateZone:
 *           type: object
 *           properties:
 *             zone:
 *               type: string
 *               description: Climate zone number
 *             description:
 *               type: string
 *               description: Zone description
 *         compliancePathway:
 *           type: object
 *           properties:
 *             pathway:
 *               type: string
 *               description: Pathway type (e.g., Performance Solution, Deemed-to-Satisfy)
 *             requirements:
 *               type: object
 *               description: Pathway requirements
 *             description:
 *               type: string
 *               description: Pathway description
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
 *             windows:
 *               type: object
 *               description: Window specifications and requirements
 *             description:
 *               type: string
 *               description: Building fabric description
 *         specialRequirements:
 *           type: object
 *           properties:
 *             requirements:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Requirement name
 *                   trigger:
 *                     type: string
 *                     description: What triggers this requirement
 *                   requirements:
 *                     type: object
 *                     description: Detailed requirements
 *             description:
 *               type: string
 *               description: Special requirements description
 *         energy:
 *           type: object
 *           properties:
 *             requirements:
 *               type: object
 *               description: Energy efficiency requirements
 *             description:
 *               type: string
 *               description: Energy efficiency description
 *         lighting:
 *           type: object
 *           properties:
 *             requirements:
 *               type: object
 *               description: Lighting requirements
 *             description:
 *               type: string
 *               description: Lighting description
 *         meters:
 *           type: object
 *           properties:
 *             requirements:
 *               type: object
 *               description: Metering requirements
 *             description:
 *               type: string
 *               description: Metering description
 *
 * /api/projects/{id}/report:
 *   get:
 *     summary: Generate a compliance report for a project
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
 *       - in: query
 *         name: section
 *         required: false
 *         schema:
 *           type: string
 *           enum: [full, building, compliance, fabric, special, energy, lighting, meters]
 *         description: "Section of the report to generate (default: full)"
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
 *       400:
 *         description: Invalid section parameter
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

// File upload routes
router.post('/:id/upload', protect, uploadFile);
router.get('/:id/files/:filename', protect, getFile);
router.delete('/:id/files/:filename', protect, deleteFile);

module.exports = router; 