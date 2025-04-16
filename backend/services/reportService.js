const Project = require('../models/Project');
const BuildingClassification = require('../models/BuildingClassification');
const ClimateZone = require('../models/ClimateZone');
const CompliancePathway = require('../models/CompliancePathway');
const BuildingFabric = require('../models/BuildingFabric');
const SpecialRequirement = require('../models/SpecialRequirement');
const SectionJPart = require('../models/SectionJPart');
const ExemptionAndConcession = require('../models/ExemptionAndConcession');
const {
  getBuildingClassification,
  getClimateZoneByLocation,
  getCompliancePathway,
  getSpecialRequirements
} = require('../utils/decisionTreeUtils');

// Update the path to point to the root directory
const decisionTree = require('../../Decision-Tree.json');

class ReportService {
  constructor(project) {
    this.project = project;
  }

  /**
   * Generate a comprehensive compliance report for a project
   * @returns {Promise<Object>} - The generated report
   */
  async generateReport() {
    try {
      const report = {
        projectInfo: this.generateProjectInfo(),
        buildingClassification: this.generateBuildingClassificationInfo(),
        climateZone: await this.generateClimateZoneInfo(),
        compliancePathway: this.generateCompliancePathwayInfo(),
        buildingFabric: this.generateBuildingFabricInfo(),
        specialRequirements: this.generateSpecialRequirementsInfo()
      };

      return report;
    } catch (error) {
      throw new Error(`Error generating report: ${error.message}`);
    }
  }

  /**
   * Generate project information section
   * @returns {Object} - Project information
   */
  generateProjectInfo() {
    return {
      name: this.project.name,
      description: this.project.description,
      buildingType: this.project.buildingType,
      location: this.project.location,
      floorArea: this.project.floorArea
    };
  }

  /**
   * Generate building classification information
   * @returns {Object} - Building classification information
   */
  generateBuildingClassificationInfo() {
    const classification = getBuildingClassification(this.project.buildingType);
    return {
      classification,
      description: `This building is classified as ${classification} according to the NCC.`
    };
  }

  /**
   * Generate climate zone information
   * @returns {Promise<Object>} - Climate zone information
   */
  async generateClimateZoneInfo() {
    const climateZone = await getClimateZoneByLocation(this.project.location);
    return {
      zone: climateZone.zone,
      state: climateZone.state,
      region: climateZone.region,
      description: `The building is located in Climate Zone ${climateZone.zone} (${climateZone.state}-${climateZone.region}).`
    };
  }

  /**
   * Generate compliance pathway information
   * @returns {Object} - Compliance pathway information
   */
  generateCompliancePathwayInfo() {
    const pathway = getCompliancePathway(this.project.buildingType, this.project.floorArea);
    return {
      pathway,
      description: `The building is required to comply using the ${pathway} pathway.`
    };
  }

  /**
   * Generate building fabric information
   * @returns {Object} - Building fabric information
   */
  generateBuildingFabricInfo() {
    return {
      walls: this.project.buildingFabric.walls,
      roof: this.project.buildingFabric.roof,
      floor: this.project.buildingFabric.floor,
      windows: this.project.buildingFabric.windows,
      description: 'Building fabric details are as follows:'
    };
  }

  /**
   * Generate special requirements information
   * @returns {Object} - Special requirements information
   */
  generateSpecialRequirementsInfo() {
    const requirements = getSpecialRequirements(
      this.project.buildingType,
      getBuildingClassification(this.project.buildingType)
    );
    return {
      requirements,
      description: 'The following special requirements apply to this building:'
    };
  }
}

module.exports = ReportService; 