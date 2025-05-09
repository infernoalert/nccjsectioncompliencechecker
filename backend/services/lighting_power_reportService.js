// backend/services/LightingPowerReportService.js

const { loadSections } = require('../utils/sectionLoader');
const { getBuildingClassification, getClimateZoneByLocation } = require('../utils/decisionTreeUtils');
const locationToClimateZone = require('../data/mappings/locationToClimateZone.json');

class LightingPowerReportService {
    /**
     * Constructor for LightingPowerReportService.
     * @param {Object} project - The project object.
     */
    constructor(project) {
        if (!project) {
            console.error("LightingPowerReportService: Project data is undefined at construction.");
            throw new Error("Project data is required for LightingPowerReportService.");
        }
        this.project = project;
        this.buildingClassification = null;
        this.climateZone = null;
        this.sections = new Map();
        this.sectionDefinitions = [];

        console.log(`LightingPowerReportService: Instantiated for project ID ${this.project._id}`);
    }

    /**
     * Initializes essential data for report generation.
     */
    async initialize() {
        console.log("LightingPowerReportService: Initializing...");
        try {
            // Load building classification
            if (this.project.buildingType) {
                this.buildingClassification = await getBuildingClassification(this.project.buildingType);
                console.log("LightingPowerReportService: Fetched Building Classification:", this.buildingClassification ? this.buildingClassification.classType : 'Not found');
            } else {
                console.warn("LightingPowerReportService: Project buildingType is undefined.");
            }

            // Load climate zone
            if (this.project.location) {
                this.climateZone = await getClimateZoneByLocation(this.project.location);
                this.locationData = locationToClimateZone.locations.find(
                    loc => loc.id === this.project.location
                );
                console.log("LightingPowerReportService: Fetched Climate Zone:", this.climateZone);
            } else {
                console.warn("LightingPowerReportService: Project location is undefined.");
            }

            // Load and validate sections
            const loadedSections = await loadSections('lighting-power');
            if (!loadedSections || Object.keys(loadedSections).length === 0) {
                throw new Error("No lighting-power sections found");
            }

            // Process and validate each section
            this.sectionDefinitions = Object.values(loadedSections)
                .filter(section => section.category === 'lighting-power')
                .map(section => this.validateSection(section));

            if (this.sectionDefinitions.length === 0) {
                throw new Error("No valid lighting-power sections found after filtering");
            }

        } catch (error) {
            console.error('Error during LightingPowerReportService initialization:', error);
            throw new Error(`Initialization failed: ${error.message}`);
        }
        console.log("LightingPowerReportService: Initialization complete.");
    }

    validateSection(section) {
        if (!section || typeof section !== 'object') {
            throw new Error('Invalid section: must be an object');
        }

        const requiredFields = ['id', 'title', 'category', 'content'];
        for (const field of requiredFields) {
            if (!section[field]) {
                throw new Error(`Invalid section: missing required field '${field}'`);
            }
        }

        if (section.category !== 'lighting-power') {
            throw new Error(`Invalid section category: expected 'lighting-power', got '${section.category}'`);
        }

        return section;
    }

    /**
     * Generate lighting & power compliance report.
     * @returns {Promise<Object>} The generated lighting & power report.
     */
    async generateReport() {
        console.log("LightingPowerReportService: Starting report generation...");
        try {
            await this.initialize();

            const projectInfo = this.generateProjectInfo();
            const buildingClassification = this.generateBuildingClassification();
            const climateZone = this.generateClimateZone();
            const lightingPowerReport = await this.generateLightingPowerReport();

            return {
                projectInfo,
                buildingClassification,
                climateZone,
                lightingPowerReport
            };

        } catch (error) {
            console.error('Error generating lighting & power report:', error);
            return this.generateErrorReport(error);
        }
    }

    generateProjectInfo() {
        return {
            name: this.project.name,
            buildingType: this.project.buildingType,
            location: this.project.location,
            floorArea: this.project.floorArea,
            totalAreaOfHabitableRooms: this.project.totalAreaOfHabitableRooms
        };
    }

    generateBuildingClassification() {
        return {
            buildingType: this.project.buildingType,
            classType: this.buildingClassification?.classType,
            name: this.buildingClassification?.name,
            description: this.buildingClassification?.description,
            typicalUse: this.buildingClassification?.typicalUse,
            commonFeatures: this.buildingClassification?.commonFeatures,
            notes: this.buildingClassification?.notes,
            technicalDetails: this.buildingClassification?.technicalDetails
        };
    }

    generateClimateZone() {
        return {
            zone: this.climateZone,
            name: `Climate Zone ${this.climateZone}`,
            description: `The building is located in Climate Zone ${this.climateZone}.`,
            annualHeatingDegreeHours: this.locationData?.['Annual heating degree hours'],
            annualCoolingDegreeHours: this.locationData?.['Annual cooling degree hours'],
            annualDehumidificationGramHours: this.locationData?.['Annual dehumidification gram hours']
        };
    }

    async generateLightingPowerReport() {
        const context = {
            project: this.project,
            buildingClassification: this.buildingClassification,
            climateZone: this.climateZone
        };

        const processedSections = await Promise.all(
            this.sectionDefinitions.map(async section => {
                if (!this.isSectionApplicable(section, context)) {
                    return null;
                }

                const processedContent = await this.processSectionContent(section, context);
                return {
                    id: section.id,
                    title: section.title,
                    content: processedContent
                };
            })
        );

        return {
            sections: processedSections.filter(section => section !== null)
        };
    }

    isSectionApplicable(section, context) {
        if (!section.applicability) {
            return true;
        }

        const { buildingClassification, climateZone, project } = context;
        const rules = section.applicability;

        // Check building class
        if (rules.buildingClasses?.length > 0) {
            if (!buildingClassification || !rules.buildingClasses.includes(buildingClassification.classType)) {
                return false;
            }
        }

        // Check climate zone
        if (rules.climateZones?.length > 0) {
            if (climateZone === null || !rules.climateZones.includes(climateZone)) {
                return false;
            }
        }

        // Check floor area
        if (rules.minFloorArea && project.floorArea < rules.minFloorArea) {
            return false;
        }
        if (rules.maxFloorArea && project.floorArea > rules.maxFloorArea) {
            return false;
        }

        // Check custom conditions
        if (rules.customConditions?.length > 0) {
            for (const condition of rules.customConditions) {
                if (condition.property && project[condition.property] !== condition.expectedValue) {
                    return false;
                }
            }
        }

        return true;
    }

    async processSectionContent(section, context) {
        if (!section.content || !Array.isArray(section.content)) {
            return [];
        }

        const processedContent = await Promise.all(
            section.content.map(async block => {
                if (!this.isBlockApplicable(block, context)) {
                    return null;
                }

                return this.processBlock(block, context);
            })
        );

        return processedContent.filter(block => block !== null);
    }

    isBlockApplicable(block, context) {
        if (!block.applicability) {
            return true;
        }

        return this.isSectionApplicable({ applicability: block.applicability }, context);
    }

    processBlock(block, context) {
        const processedBlock = { ...block };

        // Process variants if they exist
        if (block.variants?.length > 0) {
            for (const variant of block.variants) {
                if (this.isSectionApplicable({ applicability: variant.condition }, context)) {
                    Object.assign(processedBlock, variant.content);
                    break;
                }
            }
        }

        // Process table data if it exists
        if (processedBlock.contentType === 'table' && processedBlock.rows) {
            processedBlock.rows = this.processTableRows(processedBlock.rows, context);
        }

        return processedBlock;
    }

    processTableRows(rows, context) {
        if (!Array.isArray(rows)) {
            return [];
        }

        return rows.filter(row => {
            if (!row.applicability) {
                return true;
            }
            return this.isSectionApplicable({ applicability: row.applicability }, context);
        });
    }

    generateErrorReport(error) {
        return {
            projectInfo: this.generateProjectInfo(),
            buildingClassification: this.generateBuildingClassification(),
            climateZone: this.generateClimateZone(),
            lightingPowerReport: {
                status: 'error',
                message: `Error generating report: ${error.message}`,
                sections: []
            }
        };
    }
}

module.exports = LightingPowerReportService;
