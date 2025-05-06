const Project = require('../models/project');
const Requirement = require('../models/requirement');
const ClimateZone = require('../models/climate-zone');
const asyncHandler = require('express-async-handler');

// @desc    Generate compliance report for a project
// @route   GET /api/reports/:projectId
// @access  Private
const generateReport = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check for user
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Get climate zone data
  const climateZone = await ClimateZone.findOne({ zone: project.climateZone });
  if (!climateZone) {
    res.status(404);
    throw new Error('Climate zone data not found');
  }

  // Get relevant requirements
  const requirements = await Requirement.find({
    buildingTypes: project.buildingType,
    climateZones: project.climateZone
  });

  // Generate report sections
  const report = {
    projectInfo: {
      name: project.name,
      buildingType: project.buildingType,
      location: project.location,
      climateZone: project.climateZone,
      totalArea: project.totalArea,
      totalHabitableArea: project.totalHabitableArea
    },
    climateData: {
      zone: climateZone.zone,
      description: climateZone.description,
      heatingDegreeHours: climateZone.heatingDegreeHours,
      coolingDegreeHours: climateZone.coolingDegreeHours,
      dehumidificationGramHours: climateZone.dehumidificationGramHours
    },
    requirements: requirements.map(req => ({
      section: req.section,
      subsection: req.subsection,
      code: req.code,
      title: req.title,
      description: req.description,
      conditions: req.conditions,
      calculations: req.calculations
    })),
    buildingFabric: project.buildingFabric,
    specialRequirements: project.specialRequirements,
    exemptions: project.exemptions
  };

  res.json(report);
});

// @desc    Get all reports for a user
// @route   GET /api/reports
// @access  Private
const getReports = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user._id });
  const reports = [];

  for (const project of projects) {
    const climateZone = await ClimateZone.findOne({ zone: project.climateZone });
    const requirements = await Requirement.find({
      buildingTypes: project.buildingType,
      climateZones: project.climateZone
    });

    reports.push({
      projectId: project._id,
      projectName: project.name,
      buildingType: project.buildingType,
      climateZone: project.climateZone,
      totalRequirements: requirements.length,
      lastUpdated: project.updatedAt
    });
  }

  res.json(reports);
});

module.exports = {
  generateReport,
  getReports
}; 