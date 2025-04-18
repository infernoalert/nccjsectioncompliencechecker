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
  getExemptions,
  getEnergyUseRequirements,
  getVerificationMethods,
  getEnergyMonitoringRequirements
} = require('../utils/decisionTreeUtils');
const { getSection } = require('../utils/decisionTreeFactory');

class ReportService {
  constructor(project, section = 'full') {
    this.project = project;
    this.section = section;
    this.buildingClassification = null;
    this.climateZone = null;
    this.compliancePathway = null;
    this.specialRequirements = null;
    this.exemptions = null;
    this.energyUse = null;
    this.verificationMethods = null;
    this.energyMonitoring = null;
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

      if (this.section === 'full' || this.section === 'energy') {
        report.energyUse = await this.generateEnergyUseInfo();
        report.energyMonitoring = await this.generateEnergyMonitoringInfo();
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
      this.buildingClassification = getBuildingClassification(buildingType);
      
      if (!this.buildingClassification) {
        return {
          error: `Building classification not found for type: ${buildingType}`
        };
      }

      return {
        buildingType: buildingType,
        classType: this.buildingClassification.classType,
        name: this.buildingClassification.name,
        description: this.buildingClassification.description,
        typicalUse: this.buildingClassification.typicalUse,
        commonFeatures: this.buildingClassification.commonFeatures,
        notes: this.buildingClassification.notes,
        technicalDetails: this.buildingClassification.technicalDetails
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
      this.climateZone = climateZone;
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
      
      // Pass only the classType property, not the entire object
      this.compliancePathway = await getCompliancePathway(buildingClassification.classType, climateZone);
      
      return {
        pathway: this.compliancePathway.pathway,
        description: this.compliancePathway.description,
        requirements: this.compliancePathway.requirements
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
      walls: this.compliancePathway.requirements.walls,
      roof: this.compliancePathway.requirements.roof,
      floor: this.compliancePathway.requirements.floor,
      windows: this.compliancePathway.requirements.windows,
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
      
      // Pass only the classType property, not the entire object
      this.specialRequirements = await getSpecialRequirements(buildingClassification.classType);
      
      return {
        requirements: this.specialRequirements,
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
      this.exemptions = await getExemptions(buildingClassification.classType);
      
      if (!this.exemptions) {
        return {
          message: 'No exemptions apply to this building type.',
          exemptions: []
        };
      }
      
      // Convert exemptions object to array for easier rendering
      const exemptionsArray = Object.entries(this.exemptions).map(([key, value]) => ({
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

  async generateEnergyUseInfo() {
    try {
      const buildingClassification = await getBuildingClassification(this.project.buildingType);
      this.energyUse = await getEnergyUseRequirements(buildingClassification.classType);
      this.verificationMethods = await getVerificationMethods(buildingClassification.classType);
      
      return {
        limit: this.energyUse.limit,
        description: this.energyUse.description,
        verificationMethods: this.verificationMethods
      };
    } catch (error) {
      return {
        error: `Error getting energy use requirements: ${error.message}`
      };
    }
  }

  async generateEnergyMonitoringInfo() {
    try {
      // Ensure floor area is a number
      const floorArea = Number(this.project.floorArea) || 0;
      console.log(`Floor area for energy monitoring: ${floorArea} m²`);
      
      this.energyMonitoring = await getEnergyMonitoringRequirements(floorArea);
      
      return {
        requirement: this.energyMonitoring.requirement,
        details: this.energyMonitoring.details || []
      };
    } catch (error) {
      return {
        error: `Error getting energy monitoring requirements: ${error.message}`
      };
    }
  }
}

module.exports = ReportService; 