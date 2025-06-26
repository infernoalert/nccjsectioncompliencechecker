const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
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
const diagramService = require('../services/diagramService');
const { interpretChat } = require('../controllers/diagramController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MCPHandler } = require('../mcp');

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
 *     Diagram:
 *       type: object
 *       properties:
 *         nodes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               type:
 *                 type: string
 *               position:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                   y:
 *                     type: number
 *               data:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *         edges:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               source:
 *                 type: string
 *               target:
 *                 type: string
 *               type:
 *                 type: string
 *               style:
 *                 type: object
 *               animated:
 *                 type: boolean
 *               markerEnd:
 *                 type: object
 *     
 *     DiagramResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         fileName:
 *           type: string
 *         lastModified:
 *           type: string
 *           format: date-time
 *         version:
 *           type: number
 *         data:
 *           $ref: '#/components/schemas/Diagram'
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

/**
 * @swagger
 * /api/projects/{id}/interpret-chat:
 *   post:
 *     summary: Interpret chat message and generate diagram using AI Assistant
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The chat message to interpret
 *               isGenericRequest:
 *                 type: boolean
 *                 description: Whether this is a generic request (will use EMS template if true)
 *     responses:
 *       200:
 *         description: Diagram generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     nodes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Diagram/properties/nodes/items'
 *                     edges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Diagram/properties/edges/items'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: Assistant's response message
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error during diagram generation
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

// Diagram routes
router.post('/:id/diagram', protect, async (req, res) => {
  try {
    const result = await diagramService.saveDiagram(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id/diagram', protect, async (req, res) => {
  try {
    const result = await diagramService.getDiagram(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/:id/diagram', protect, async (req, res) => {
  try {
    const result = await diagramService.deleteDiagram(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Diagram generation routes
router.post('/:id/interpret-chat', protect, interpretChat);

// AI Analysis endpoint
router.post('/:projectId/analyze/:filename', protect, async (req, res) => {
  try {
    const { projectId, filename } = req.params;
    const project = await Project.findById(projectId).populate('files');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Find the file in project files
    const file = project.files.find(f => f.filename === filename);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get the full file path using the file's path property
    const filePath = path.join(process.cwd(), file.path);

    // Initialize MCP handler with OpenAI API key
    const mcpHandler = new MCPHandler(projectId, process.env.OPENAI_API_KEY);

    // Process the file - MCP handles all project updates internally
    const result = await mcpHandler.processExistingFile(filePath);

    // Get device count from the MCP history for user feedback
    let deviceCount = 0;
    let documentType = 'document';
    let processingMethod = 'standard';

    // Extract device count and processing info from MCP history
    if (result && result.history) {
      const projectUpdateEntry = result.history.find(entry => entry.step === 'PROJECT_UPDATE');
      if (projectUpdateEntry && projectUpdateEntry.metadata) {
        deviceCount = projectUpdateEntry.metadata.deviceCount || 0;
      }
      
      const textExtractionEntry = result.history.find(entry => entry.step === 'TEXT_EXTRACTION');
      if (textExtractionEntry && textExtractionEntry.metadata) {
        documentType = textExtractionEntry.metadata.documentType || 'document';
        processingMethod = textExtractionEntry.metadata.processingMethod || 'standard';
      }
    }

    // Create user-friendly message
    const processingInfo = documentType === 'electrical_spec' 
      ? 'electrical specification (text parsing only)'
      : 'document (text parsing + OCR)';

    let userMessage;
    if (deviceCount === 0) {
      userMessage = `✅ Analysis completed! No energy monitoring devices were found in this ${processingInfo}. Please refresh the page to see any updated project data.`;
    } else if (deviceCount === 1) {
      userMessage = `✅ Analysis completed! Found 1 energy monitoring device in this ${processingInfo}. Please refresh the page to see the new device.`;
    } else {
      userMessage = `✅ Analysis completed! Found ${deviceCount} energy monitoring devices in this ${processingInfo}. Please refresh the page to see the new devices.`;
    }

    res.json({ 
      success: true,
      message: userMessage,
      deviceCount: deviceCount,
      documentType: documentType,
      processingMethod: processingMethod,
      refreshRequired: true,
      results: result
    });
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ 
      success: false,
      error: '❌ Analysis failed. Please try again or contact support if the issue persists.',
      details: error.message,
      refreshRequired: false
    });
  }
});

module.exports = router; 