const Project = require('../models/Project');
const BuildingClassification = require('../models/BuildingClassification');
const ClimateZone = require('../models/ClimateZone');
const CompliancePathway = require('../models/CompliancePathway');
const BuildingFabric = require('../models/BuildingFabric');
const SpecialRequirement = require('../models/SpecialRequirement');
const SectionJPart = require('../models/SectionJPart');
const ExemptionAndConcession = require('../models/ExemptionAndConcession');
const decisionTree = require('../data/Decision-Tree.json');
const {
  getBuildingClassification,
  getClimateZoneRequirements,
  getCompliancePathways,
  getSpecialRequirements,
  getExemptions
} = require('../utils/decisionTreeUtils');

class ReportService {
  /**
   * Generate a comprehensive compliance report for a project
   * @param {string} projectId - The ID of the project
   * @returns {Promise<Object>} - The generated report
   */
  async generateReport(projectId) {
    try {
      // Fetch the project with all related data
      const project = await Project.findById(projectId)
        .populate('buildingClassification')
        .populate('climateZone')
        .populate('buildingFabric')
        .populate('compliancePathway')
        .populate('specialRequirements');

      if (!project) {
        throw new Error('Project not found');
      }

      // Generate the report sections
      const report = {
        projectInfo: this.generateProjectInfo(project),
        buildingClassification: this.generateBuildingClassificationInfo(project),
        climateZone: this.generateClimateZoneInfo(project),
        compliancePathway: this.generateCompliancePathwayInfo(project),
        buildingFabric: this.generateBuildingFabricInfo(project),
        specialRequirements: this.generateSpecialRequirementsInfo(project),
        complianceResults: this.generateComplianceResults(project),
        documentation: this.generateDocumentationInfo(project),
        metadata: {
          generatedAt: new Date(),
          reportVersion: '1.0'
        }
      };

      return report;
    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  /**
   * Generate project information section
   * @param {Object} project - The project object
   * @returns {Object} - Project information
   */
  generateProjectInfo(project) {
    return {
      name: project.name,
      description: project.description || 'No description provided',
      buildingType: project.buildingType,
      location: project.location,
      owner: project.owner,
      floorArea: project.floorArea,
      size: project.size,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }

  /**
   * Generate building classification information
   * @param {Object} project - The project object
   * @returns {Object} - Building classification information
   */
  generateBuildingClassificationInfo(project) {
    const buildingClass = project.buildingClassification;
    if (!buildingClass) {
      return { error: 'Building classification not found' };
    }

    // Get additional information from Decision-Tree.json using the utility
    const decisionTreeClass = getBuildingClassification(buildingClass.classType);
    
    return {
      classType: buildingClass.classType,
      description: buildingClass.description,
      subtypes: buildingClass.subtypes,
      climateZones: buildingClass.climateZones,
      sizeBasedProvisions: buildingClass.sizeBasedProvisions,
      compliancePathways: buildingClass.compliancePathways,
      applicableClauses: buildingClass.applicableClauses,
      decisionTreeInfo: decisionTreeClass || null
    };
  }

  /**
   * Generate climate zone information
   * @param {Object} project - The project object
   * @returns {Object} - Climate zone information
   */
  generateClimateZoneInfo(project) {
    const climateZone = project.climateZone;
    if (!climateZone) {
      return { error: 'Climate zone not found' };
    }

    // Get climate zone requirements from Decision-Tree.json
    const buildingClass = project.buildingClassification;
    const zoneRange = climateZone.code.replace('CZ', 'Zones_');
    const climateZoneRequirements = getClimateZoneRequirements(buildingClass.classType, zoneRange);

    return {
      name: climateZone.name,
      code: climateZone.code,
      description: climateZone.description,
      temperatureRange: climateZone.temperatureRange,
      humidityRange: climateZone.humidityRange,
      solarRadiation: climateZone.solarRadiation,
      windSpeed: climateZone.windSpeed,
      requirements: climateZoneRequirements || null
    };
  }

  /**
   * Generate compliance pathway information
   * @param {Object} project - The project object
   * @returns {Object} - Compliance pathway information
   */
  generateCompliancePathwayInfo(project) {
    const compliancePathway = project.compliancePathway;
    if (!compliancePathway) {
      return { error: 'Compliance pathway not found' };
    }

    // Get compliance pathways from Decision-Tree.json
    const buildingClass = project.buildingClassification;
    const availablePathways = getCompliancePathways(buildingClass.classType);

    return {
      name: compliancePathway.name,
      description: compliancePathway.description,
      applicability: compliancePathway.applicability,
      verification: compliancePathway.verification,
      requirements: compliancePathway.requirements,
      availablePathways: availablePathways || []
    };
  }

  /**
   * Generate building fabric information
   * @param {Object} project - The project object
   * @returns {Object} - Building fabric information
   */
  generateBuildingFabricInfo(project) {
    const buildingFabric = project.buildingFabric;
    if (!buildingFabric) {
      return { error: 'Building fabric not found' };
    }

    return {
      walls: buildingFabric.walls,
      roof: buildingFabric.roof,
      floor: buildingFabric.floor,
      glazing: buildingFabric.glazing
    };
  }

  /**
   * Generate special requirements information
   * @param {Object} project - The project object
   * @returns {Object} - Special requirements information
   */
  generateSpecialRequirementsInfo(project) {
    // Get special requirements from the database
    const specialRequirements = project.specialRequirements;
    
    // Get additional special requirements from Decision-Tree.json
    const decisionTreeRequirements = getSpecialRequirements(project);
    
    // Combine both sources
    const allRequirements = [];
    
    if (specialRequirements && specialRequirements.length > 0) {
      allRequirements.push(...specialRequirements.map(req => ({
        name: req.name,
        trigger: req.trigger,
        requirements: req.requirements,
        conditions: req.conditions,
        exemptions: req.exemptions
      })));
    }
    
    if (decisionTreeRequirements && decisionTreeRequirements.length > 0) {
      allRequirements.push(...decisionTreeRequirements);
    }
    
    if (allRequirements.length === 0) {
      return { message: 'No special requirements specified' };
    }
    
    return allRequirements;
  }

  /**
   * Generate compliance results
   * @param {Object} project - The project object
   * @returns {Object} - Compliance results
   */
  generateComplianceResults(project) {
    const complianceResults = project.complianceResults;
    if (!complianceResults) {
      return { message: 'Compliance check not performed yet' };
    }

    return {
      status: complianceResults.status,
      checks: complianceResults.checks,
      lastChecked: complianceResults.lastChecked,
      nextReviewDate: complianceResults.nextReviewDate
    };
  }

  /**
   * Generate documentation information
   * @param {Object} project - The project object
   * @returns {Object} - Documentation information
   */
  generateDocumentationInfo(project) {
    const documentation = project.documentation;
    if (!documentation || documentation.length === 0) {
      return { message: 'No documentation provided' };
    }

    return documentation.map(doc => ({
      name: doc.name,
      type: doc.type,
      url: doc.url,
      uploadDate: doc.uploadDate
    }));
  }
}

module.exports = new ReportService(); 