const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const LightingPowerReportService = require('../services/lighting_power_reportService');

// @desc    Generate lighting & power report for a project
// @route   GET /api/lighting-power/:id/report
// @access  Private
exports.generateLightingPowerReport = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check if user owns the project or is an admin
  if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to access this project');
  }

  try {
    const reportService = new LightingPowerReportService(project);
    const report = await reportService.generateReport();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to generate lighting & power report: ${error.message}`);
  }
}); 