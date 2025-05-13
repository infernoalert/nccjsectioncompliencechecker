// backend/services/reportService.js
const Project = require('../models/Project.js'); // Assuming still needed for project data access
const { loadSections } = require('../utils/sectionLoader.js'); // Import the new loader
const { getBuildingClassification, getClimateZoneByLocation } = require('../utils/decisionTreeUtils.js'); // Keep necessary utils
const locationToClimateZone = require('../data/mappings/locationToClimateZone.json'); // Keep if needed for climate zone details
const DynamicSectionsGenerator = require('./generateDynamicSections.js');

// --- Retain JS Calculation Imports ---
const j1p2totalheatingload = require('../data/elemental-provisions/j1p2totalheatingload.js');
const j1p2totalcoolingload = require('../data/elemental-provisions/j1p2totalcoolingload.js');
const j1p2thermalenergyload = require('../data/elemental-provisions/j1p2thermalenergyload.js');
// --- End JS Calculation Imports ---


class ReportService {
    constructor(project, section = 'full') {
        if (!project) {
            throw new Error("Project data is required for ReportService.");
        }
        this.project = project;
        // Normalize section parameter to lowercase for consistent checks
        this.sectionParam = section ? section.toLowerCase() : 'full';
        this.buildingClassification = null; // Cache fetched classification
        this.climateZone = null; // Cache fetched climate zone
    }

    /**
     * Initialize essential project properties like classification and climate zone.
     */
    async initialize() {
        // Fetch and cache these upfront as they are needed frequently
        this.buildingClassification = await getBuildingClassification(this.project.buildingType);
        this.climateZone = await getClimateZoneByLocation(this.project.location);
    }

    /**
     * Generate a comprehensive compliance report for a project.
     * @returns {Promise<Object>} - The generated report
     */
    async generateReport() {
        try {
            await this.initialize(); // Ensure classification and zone are loaded

            const report = {};

            // --- Static/Core Sections (Generated directly from project/models/calcs) ---
            if (this.shouldIncludeSection('projectinfo')) { // Use helper for clarity
                 report.projectInfo = this.generateProjectInfo();
            }
            if (this.shouldIncludeSection('buildingclassification')) {
                 report.buildingClassification = await this.generateBuildingClassificationInfo(); // Keep existing logic
            }
             if (this.shouldIncludeSection('climatezone')) {
                 report.climateZone = await this.generateClimateZoneInfo(); // Keep existing logic
             }

            // --- JS Calculation Sections (Keep separate) ---
            // Add J1P2 calculations only if the section is requested ('full' or 'energy')
            // AND only for applicable building classes
            if (this.shouldIncludeSection('energy') && this.buildingClassification &&
                (this.buildingClassification.classType === 'Class_2' ||
                 this.buildingClassification.classType === 'Class_4'))
            {
                 if (this.shouldIncludeSection('j1p2calc')) { // Optional: check specific calc section
                      report.j1p2calc = await this.generateJ1P2CalcInfo(); // Keep existing J1P2 calc logic
                 }
            }

            // Use the DynamicSectionsGenerator for all dynamic sections
            const dynamicSectionsGenerator = new DynamicSectionsGenerator(
                this.project,
                this.sectionParam,
                this.buildingClassification,
                this.climateZone,
                'elemental-provisions'  // Explicitly pass the section type
            );
            report.dynamicSections = await dynamicSectionsGenerator.generateDynamicSections();

            return report;
        } catch (error) {
            console.error('Error generating report:', error);
            // Consider more specific error reporting
            throw new Error(`Failed to generate report: ${error.message}`);
        }
    }

    /**
     * Checks if a section should be included based on the 'section' query parameter.
     * @param {string} sectionKey - The key of the section to check (lowercase).
     * @returns {boolean} - True if the section should be included.
     */
    shouldIncludeSection(sectionKey) {
        if (this.sectionParam === 'full') {
            return true;
        }
        return this.sectionParam === sectionKey.toLowerCase();
    }

    // --- Keep Core/Static/Calculation Generator Methods ---

    /**
     * Generate project information section
     * @returns {Object} - Project information
     */
    generateProjectInfo() {
        // Basic info directly from the project model
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
      * (Assumes this.initialize() has been called)
      * @returns {Promise<Object>} - Building classification information
      */
     async generateBuildingClassificationInfo() {
         try {
             if (!this.buildingClassification) {
                 // Fallback if initialize wasn't called or failed
                 this.buildingClassification = await getBuildingClassification(this.project.buildingType);
             }
             if (!this.buildingClassification) {
                 return { error: `Building classification not found for type: ${this.project.buildingType}` };
             }
             // Return structure expected by frontend
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
     * (Assumes this.initialize() has been called)
     * @returns {Promise<Object>} - Climate zone information
     */
    async generateClimateZoneInfo() {
        try {
            if (this.climateZone === null) {
                 // Fallback if initialize wasn't called or failed
                 this.climateZone = await getClimateZoneByLocation(this.project.location);
            }

             if (this.climateZone === null) {
                 return { error: `Could not determine climate zone for location: ${this.project.location}` };
             }

            const locationData = locationToClimateZone.locations.find(
                loc => loc.id === this.project.location // Assumes loc.id matches project.location format
            );

            const isClass2OrClass4 = this.buildingClassification &&
                                     (this.buildingClassification.classType === 'Class_2' ||
                                      this.buildingClassification.classType === 'Class_4');

            const climateInfo = {
                 // Assuming climateZone variable holds the numeric zone (e.g., 5)
                zone: this.climateZone,
                // Construct name/description or retrieve from a zones definition file if needed
                name: `Climate Zone ${this.climateZone}`,
                description: `The building is located in Climate Zone ${this.climateZone}.`
            };

            // Add heating/cooling data specific to Class 2/4 if available
            if (isClass2OrClass4 && locationData) {
                climateInfo.annualHeatingDegreeHours = locationData['Annual heating degree hours'];
                climateInfo.annualCoolingDegreeHours = locationData['Annual cooling degree hours'];
                climateInfo.annualDehumidificationGramHours = locationData['Annual dehumidification gram hours'];
            }

            return climateInfo;
        } catch (error) {
            console.error('Error generating climate zone info:', error);
            return { error: `Error getting climate zone info: ${error.message}` };
        }
    }


    /**
     * Generate J1P2 calculation information
     * @returns {Promise<Object>} - J1P2 calculation information
     */
    async generateJ1P2CalcInfo() {
        try {
            const locationData = locationToClimateZone.locations.find(
                loc => loc.id === this.project.location
            );

            // Provide defaults if locationData or specific values are missing
            const annualHeatingDegreeHours = locationData?.['Annual heating degree hours'] ?? 15000;
            const annualCoolingDegreeHours = locationData?.['Annual cooling degree hours'] ?? 5000;
            const annualDehumidificationGramHours = locationData?.['Annual dehumidification gram hours'] ?? 1000;
            const totalAreaOfHabitableRooms = this.project.totalAreaOfHabitableRooms || 100; // Default if not set

            // Define getter functions for the calculation modules
            const getHeatingDegreeHours = () => annualHeatingDegreeHours;
            const getCoolingDegreeHours = () => annualCoolingDegreeHours;
            const getDehumidificationGramHours = () => annualDehumidificationGramHours;
            const getTotalAreaOfHabitableRooms = () => totalAreaOfHabitableRooms;

            const heatingLoadResult = j1p2totalheatingload(getHeatingDegreeHours, getTotalAreaOfHabitableRooms);
            const coolingLoadResult = j1p2totalcoolingload(getCoolingDegreeHours, getDehumidificationGramHours, getTotalAreaOfHabitableRooms);

            // Prepare inputs for thermal load calculation
            const getHeatingLoadLimit = () => parseFloat(heatingLoadResult.descriptionValue) || 30; // Default if parsing fails
            const getCoolingLoadLimit = () => parseFloat(coolingLoadResult.descriptionValue) || 45; // Default if parsing fails

            const thermalLoadResult = j1p2thermalenergyload(getHeatingLoadLimit, getCoolingLoadLimit);

            // Structure the results
            return {
                totalheatingload: {
                    description: heatingLoadResult.description,
                    descriptionValue: heatingLoadResult.descriptionValue
                },
                totalcoolingload: {
                    description: coolingLoadResult.description,
                    descriptionValue: coolingLoadResult.descriptionValue
                },
                thermalenergyload: {
                    description: thermalLoadResult.description,
                    descriptionValue: thermalLoadResult.descriptionValue
                }
            };
        } catch (error) {
             console.error('Error generating J1P2 calculation info:', error);
            return { error: `Error getting J1P2 calculation information: ${error.message}` };
        }
    }
}

module.exports = ReportService;