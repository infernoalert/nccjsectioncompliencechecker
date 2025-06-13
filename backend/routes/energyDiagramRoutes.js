const express = require('express');
const router = express.Router();
const energyDiagramController = require('../controllers/energyDiagramController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     EnergyMonitoringDevice:
 *       type: object
 *       required:
 *         - monitoringDeviceType
 *         - label
 *         - panel
 *       properties:
 *         _id:
 *           type: string
 *           description: Device ID
 *         label:
 *           type: string
 *           description: Device label/name
 *         panel:
 *           type: string
 *           description: Panel identifier
 *         monitoringDeviceType:
 *           type: string
 *           enum: [smart-meter, general-meter, memory-meter, auth-meter]
 *           description: Type of monitoring device
 *         description:
 *           type: string
 *           description: Device description
 *         connection:
 *           type: string
 *           description: Connection type
 *         status:
 *           type: string
 *           enum: [active, inactive, maintenance]
 *           description: Device status
 *     
 *     DiagramCommand:
 *       type: object
 *       properties:
 *         commands:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of diagram commands following the programming language specification
 *         metadata:
 *           type: object
 *           properties:
 *             generatedAt:
 *               type: string
 *               format: date-time
 *               description: Generation timestamp
 *             version:
 *               type: string
 *               description: Version of the generator
 *             diagramType:
 *               type: string
 *               description: Type of diagram
 *             nodeCount:
 *               type: number
 *               description: Total number of nodes
 *             meterTypes:
 *               type: array
 *               items:
 *                 type: string
 *               description: Types of meters included
 *             projectId:
 *               type: string
 *               description: Project identifier
 *             projectName:
 *               type: string
 *               description: Project name
 *             generator:
 *               type: string
 *               description: Generator name
 *         nodePositions:
 *           type: object
 *           description: Node positions mapping
 *         nodeIds:
 *           type: object
 *           description: Node IDs mapping
 *         executionInstructions:
 *           type: object
 *           properties:
 *             description:
 *               type: string
 *               description: How to execute the commands
 *             commandFormat:
 *               type: string
 *               description: Command format specification
 *             totalCommands:
 *               type: number
 *               description: Total number of commands

 */

/**
 * @swagger
 * /api/projects/{projectId}/energy-diagram/generate:
 *   post:
 *     summary: Generate diagram commands from project's energy monitoring data
 *     description: |
 *       Generates diagram commands based on the energy monitoring devices configured in the project.
 *       Creates a hierarchical diagram with cloud infrastructure, on-premise servers, and energy meters.
 *       Smart meters connect to both cloud and on-premise, while other meters connect only to on-premise.
 *     tags: [Energy Diagram Generator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID to generate diagram for
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               saveToFile:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to save the commands to a JSON file
 *     responses:
 *       200:
 *         description: Diagram commands generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     fileInfo:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         filePath:
 *                           type: string
 *                           description: Full path to saved file
 *                         filename:
 *                           type: string
 *                           description: Generated filename
 *                         diagramData:
 *                           type: object
 *                           description: Complete diagram data
 *                 - $ref: '#/components/schemas/DiagramCommand'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Project not found"
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error during diagram generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to generate energy diagram"
 *                 details:
 *                   type: string
 *                   description: Detailed error message
 */
router.post('/projects/:projectId/energy-diagram/generate', energyDiagramController.generateFromProject);

module.exports = router; 