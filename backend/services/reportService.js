const Project = require('../models/Project');
const ClimateZone = require('../models/ClimateZone');
const CompliancePathway = require('../models/CompliancePathway');
const BuildingFabric = require('../models/BuildingFabric');
const SpecialRequirement = require('../models/SpecialRequirement');
const SectionJPart = require('../models/SectionJPart');
const ExemptionAndConcession = require('../models/ExemptionAndConcession');
const {
  getClimateZoneByLocation,
  getCompliancePathway,
  getSpecialRequirements
} = require('../utils/decisionTreeUtils');
const buildingTypeMapping = require('../data/mappings/buildingTypeToClassification.json');

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
    try {
      const buildingType = this.project.buildingType;
      const buildingTypeInfo = buildingTypeMapping.buildingTypes.find(type => type.id === buildingType);
      
      if (!buildingTypeInfo) {
        return {
          error: `Building type not found: ${buildingType}`
        };
      }

      return {
        classType: buildingTypeInfo.nccClassification,
        description: buildingTypeInfo.description,
        typicalUse: buildingTypeInfo.typicalUse,
        commonFeatures: buildingTypeInfo.commonFeatures,
        notes: buildingTypeInfo.notes
      };
    } catch (error) {
      return {
        error: `Error getting building classification: ${error.message}`
      };
    }
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