const Project = require('../models/Project');
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
  getSpecialRequirements,
  getExemptions
} = require('../utils/decisionTreeUtils');
const { getSection } = require('../utils/decisionTreeFactory');

class ReportService {
  constructor(project, section = 'full') {
    this.project = project;
    this.section = section;
  }

  /**
   * Generate a comprehensive compliance report for a project
   * @returns {Promise<Object>} - The generated report
   */
  async generateReport() {
    try {
      // Base report with project info
      const report = {
        projectInfo: this.generateProjectInfo(),
      };

      // Add section-specific information based on the requested section
      if (this.section === 'full' || this.section === 'building') {
        report.buildingClassification = await this.generateBuildingClassificationInfo();
        report.climateZone = await this.generateClimateZoneInfo();
      }

      if (this.section === 'full' || this.section === 'compliance') {
        report.compliancePathway = await this.generateCompliancePathwayInfo();
      }

      if (this.section === 'full' || this.section === 'fabric') {
        report.buildingFabric = this.generateBuildingFabricInfo();
      }

      if (this.section === 'full' || this.section === 'special') {
        report.specialRequirements = await this.generateSpecialRequirementsInfo();
      }

      if (this.section === 'full' || this.section === 'exemptions') {
        report.exemptions = await this.generateExemptionsInfo();
      }

      // Add section-specific information if a specific section is requested
      if (this.section !== 'full') {
        const sectionData = await this.generateSectionSpecificInfo();
        if (sectionData) {
          report[this.section] = sectionData;
        }
      }

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
   * @returns {Promise<Object>} - Building classification information
   */
  async generateBuildingClassificationInfo() {
    try {
      const buildingType = this.project.buildingType;
      const buildingClassification = getBuildingClassification(buildingType);
      
      if (!buildingClassification) {
        return {
          error: `Building classification not found for type: ${buildingType}`
        };
      }

      return {
        buildingType: buildingType,
        classType: buildingClassification.classType,
        description: buildingClassification.description,
        typicalUse: buildingClassification.typicalUse,
        commonFeatures: buildingClassification.commonFeatures,
        notes: buildingClassification.notes
      };
    } catch (error) {
      console.error('Error generating building classification info:', error);
      return {
        error: `Error generating building classification info: ${error.message}`
      };
    }
  }

  /**
   * Generate climate zone information
   * @returns {Promise<Object>} - Climate zone information
   */
  async generateClimateZoneInfo() {
    try {
      const climateZone = await getClimateZoneByLocation(this.project.location);
      return {
        zone: climateZone,
        description: `The building is located in Climate Zone ${climateZone}.`
      };
    } catch (error) {
      return {
        error: `Error getting climate zone: ${error.message}`
      };
    }
  }

  /**
   * Generate compliance pathway information
   * @returns {Promise<Object>} - Compliance pathway information
   */
  async generateCompliancePathwayInfo() {
    try {
      const buildingClassification = await getBuildingClassification(this.project.buildingType);
      const climateZone = await getClimateZoneByLocation(this.project.location);
      const pathway = await getCompliancePathway(buildingClassification, climateZone);
      
      return {
        pathway: pathway.pathway,
        requirements: pathway.requirements,
        description: `The building is required to comply using the ${pathway.pathway} pathway.`
      };
    } catch (error) {
      return {
        error: `Error getting compliance pathway: ${error.message}`
      };
    }
  }

  /**
   * Generate building fabric information
   * @returns {Object} - Building fabric information
   */
  generateBuildingFabricInfo() {
    if (!this.project.buildingFabric) {
      return {
        error: 'No building fabric information available'
      };
    }
    
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
   * @returns {Promise<Object>} - Special requirements information
   */
  async generateSpecialRequirementsInfo() {
    try {
      const buildingClassification = await getBuildingClassification(this.project.buildingType);
      const requirements = await getSpecialRequirements(buildingClassification);
      
      return {
        requirements,
        description: 'The following special requirements apply to this building:'
      };
    } catch (error) {
      return {
        error: `Error getting special requirements: ${error.message}`
      };
    }
  }

  /**
   * Generate section-specific information
   * @returns {Promise<Object>} - Section-specific information
   */
  async generateSectionSpecificInfo() {
    try {
      // Get the section-specific decision tree
      const sectionData = await getSection(this.section);
      if (!sectionData) {
        return null;
      }

      // Get the building classification and climate zone
      const buildingClassification = await getBuildingClassification(this.project.buildingType);
      const climateZone = await getClimateZoneByLocation(this.project.location);

      // Return section-specific information
      return {
        requirements: sectionData.requirements,
        description: `Section ${this.section} requirements for ${buildingClassification} in Climate Zone ${climateZone}.`
      };
    } catch (error) {
      console.error(`Error generating section-specific info for ${this.section}:`, error);
      return null;
    }
  }

  /**
   * Generate exemptions information
   * @returns {Promise<Object>} - Exemptions information
   */
  async generateExemptionsInfo() {
    try {
      const buildingClassification = await getBuildingClassification(this.project.buildingType);
      const exemptions = await getExemptions(buildingClassification);
      
      if (!exemptions) {
        return {
          message: 'No exemptions apply to this building type.',
          exemptions: []
        };
      }
      
      // Convert exemptions object to array for easier rendering
      const exemptionsArray = Object.entries(exemptions).map(([key, value]) => ({
        id: key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        ...value
      }));
      
      return {
        message: 'The following exemptions may apply to this building:',
        exemptions: exemptionsArray
      };
    } catch (error) {
      return {
        error: `Error getting exemptions: ${error.message}`,
        exemptions: []
      };
    }
  }
}

module.exports = ReportService; 