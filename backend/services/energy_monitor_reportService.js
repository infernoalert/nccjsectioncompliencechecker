// backend/services/EnergyMonitorReportService.js

const { getBuildingClassification, getClimateZoneByLocation } = require('../utils/decisionTreeUtils.js');
const locationToClimateZone = require('../data/mappings/locationToClimateZone.json');
const DynamicSectionsGenerator = require('./generateDynamicSections.js');

class EnergyMonitorReportService {
    /**
     * Constructor for EnergyMonitorReportService.
     * @param {Object} project - The project object.
     * @param {string} section - The section parameter.
     */
    constructor(project, section = 'full') {
        if (!project) {
            throw new Error("Project data is required for EnergyMonitorReportService.");
        }
        this.project = project;
        this.sectionParam = section ? section.toLowerCase() : 'full';
        this.buildingClassification = null;
        this.climateZone = null;
    }

    /**
     * Initializes essential data for report generation.
     */
    async initialize() {
        try {
            // Load building classification
            if (this.project.buildingType) {
                this.buildingClassification = await getBuildingClassification(this.project.buildingType);
            }

            // Load climate zone
            if (this.project.location) {
                this.climateZone = await getClimateZoneByLocation(this.project.location);
            }
        } catch (error) {
            console.error('Error during initialization:', error);
            throw new Error(`Initialization failed: ${error.message}`);
        }
    }

    /**
     * Generate lighting & power compliance report.
     * @returns {Promise<Object>} The generated lighting & power report.
     */
    async generateReport() {
        try {
            await this.initialize();

            const report = {};

            if (this.shouldIncludeSection('projectinfo')) {
                report.projectInfo = this.generateProjectInfo();
            }
            if (this.shouldIncludeSection('buildingclassification')) {
                report.buildingClassification = await this.generateBuildingClassificationInfo();
            }
            if (this.shouldIncludeSection('climatezone')) {
                report.climateZone = await this.generateClimateZoneInfo();
            }

            // Use the DynamicSectionsGenerator
            const dynamicSectionsGenerator = new DynamicSectionsGenerator(
                this.project,
                this.sectionParam,
                this.buildingClassification,
                this.climateZone,
                'j9monitor'
            );
            report.dynamicSections = await dynamicSectionsGenerator.generateDynamicSections();

            return report;
        } catch (error) {
            console.error('Error generating report:', error);
            throw new Error(`Failed to generate report: ${error.message}`);
        }
    }

    shouldIncludeSection(sectionKey) {
        if (this.sectionParam === 'full') {
            return true;
        }
        return this.sectionParam === sectionKey.toLowerCase();
    }

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
                zone: this.climateZone.id,
                name: `Climate Zone ${this.climateZone.id}`,
                description: `The building is located in Climate Zone ${this.climateZone.id}.`,
                annualHeatingDegreeHours: locationData?.['Annual heating degree hours'],
                annualCoolingDegreeHours: locationData?.['Annual cooling degree hours'],
                annualDehumidificationGramHours: locationData?.['Annual dehumidification gram hours']
            };
        } catch (error) {
            console.error('Error generating climate zone info:', error);
            return { error: `Error getting climate zone info: ${error.message}` };
        }
    }
}

module.exports = EnergyMonitorReportService;
