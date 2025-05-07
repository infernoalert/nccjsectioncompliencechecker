const Project = require('../models/Project');
const { loadReportSections } = require('../utils/sectionLoader');
const { getBuildingClassification, getClimateZoneByLocation } = require('../utils/decisionTreeUtils');
const locationToClimateZone = require('../data/mappings/locationToClimateZone.json');

class ElectricalReportService {
    constructor(project, section = 'full') {
        if (!project) {
            throw new Error("Project data is required for ElectricalReportService.");
        }
        this.project = project;
        this.sectionParam = section ? section.toLowerCase() : 'full';
        this.buildingClassification = null;
        this.climateZone = null;
    }

    /**
     * Initialize essential project properties
     */
    async initialize() {
        this.buildingClassification = await getBuildingClassification(this.project.buildingType);
        this.climateZone = await getClimateZoneByLocation(this.project.location);
    }

    /**
     * Generate electrical compliance report
     * @returns {Promise<Object>} The generated electrical report
     */
    async generateReport() {
        try {
            await this.initialize();

            const report = {};

            // Core Sections
            if (this.shouldIncludeSection('projectinfo')) {
                report.projectInfo = this.generateProjectInfo();
            }
            if (this.shouldIncludeSection('buildingclassification')) {
                report.buildingClassification = await this.generateBuildingClassificationInfo();
            }
            if (this.shouldIncludeSection('climatezone')) {
                report.climateZone = await this.generateClimateZoneInfo();
            }

            // Electrical Specific Sections
            if (this.shouldIncludeSection('electrical')) {
                report.electricalSections = await this.generateElectricalSections();
            }

            return report;
        } catch (error) {
            console.error('Error generating electrical report:', error);
            throw new Error(`Failed to generate electrical report: ${error.message}`);
        }
    }

    /**
     * Checks if a section should be included based on the section parameter
     */
    shouldIncludeSection(sectionKey) {
        if (this.sectionParam === 'full') {
            return true;
        }
        return this.sectionParam === sectionKey.toLowerCase();
    }

    /**
     * Generate project information section
     */
    generateProjectInfo() {
        return {
            name: this.project.name,
            description: this.project.description,
            buildingType: this.project.buildingType,
            location: this.project.location,
            floorArea: this.project.floorArea,
            totalAreaOfHabitableRooms: this.project.totalAreaOfHabitableRooms
        };
    }

    /**
     * Generate building classification information
     */
    async generateBuildingClassificationInfo() {
        try {
            if (!this.buildingClassification) {
                this.buildingClassification = await getBuildingClassification(this.project.buildingType);
            }
            if (!this.buildingClassification) {
                return { error: `Building classification not found for type: ${this.project.buildingType}` };
            }
            return {
                buildingType: this.project.buildingType,
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
            return { error: `Error generating building classification info: ${error.message}` };
        }
    }

    /**
     * Generate climate zone information
     */
    async generateClimateZoneInfo() {
        try {
            if (this.climateZone === null) {
                this.climateZone = await getClimateZoneByLocation(this.project.location);
            }
            if (this.climateZone === null) {
                return { error: `Could not determine climate zone for location: ${this.project.location}` };
            }

            const locationData = locationToClimateZone.locations.find(
                loc => loc.id === this.project.location
            );

            return {
                zone: this.climateZone,
                name: `Climate Zone ${this.climateZone}`,
                description: `The building is located in Climate Zone ${this.climateZone}.`,
                locationData: locationData || {}
            };
        } catch (error) {
            console.error('Error generating climate zone info:', error);
            return { error: `Error getting climate zone info: ${error.message}` };
        }
    }

    /**
     * Generate electrical specific sections
     */
    async generateElectricalSections() {
        // TODO: Implement electrical specific sections
        return {
            lighting: {
                status: 'pending',
                requirements: []
            },
            power: {
                status: 'pending',
                requirements: []
            },
            metering: {
                status: 'pending',
                requirements: []
            }
        };
    }
}

module.exports = ElectricalReportService; 