const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const J6HvacReportService = require('../services/j6hvac_reportService');
const path = require('path');
const fs = require('fs').promises;

/**
 * @swagger
 * /api/projects/{id}/j6hvac-report:
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
 *     responses:
 *       200:
 *         description: J6 HVAC report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projectId:
 *                   type: string
 *                 projectName:
 *                   type: string
 *                 buildingType:
 *                   type: string
 *                 location:
 *                   type: string
 *                 floorArea:
 *                   type: number
 *                 totalAreaOfHabitableRooms:
 *                   type: number
 *                 status:
 *                   type: string
 *                 buildingClassification:
 *                   type: object
 *                 climateZone:
 *                   type: object
 *                 compliancePathway:
 *                   type: string
 *                 buildingFabric:
 *                   type: object
 *                 specialRequirements:
 *                   type: array
 *                 sections:
 *                   type: array
 *                   items:
 *                     type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
const generateJ6HvacReport = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const sectionType = req.query.sectionType || 'j6hvac';

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user owns the project or is an admin
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this project'
      });
    }

    const reportService = new J6HvacReportService(project);
    const report = await reportService.generateReport();

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in generateJ6HvacReport:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = {
  generateJ6HvacReport
}; 