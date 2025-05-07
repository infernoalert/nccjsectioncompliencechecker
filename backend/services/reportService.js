// backend/services/reportService.js
const Project = require('../models/Project'); // Assuming still needed for project data access
const { loadReportSections } = require('../utils/sectionLoader'); // Import the new loader
const { getBuildingClassification, getClimateZoneByLocation } = require('../utils/decisionTreeUtils'); // Keep necessary utils
const locationToClimateZone = require('../data/mappings/locationToClimateZone.json'); // Keep if needed for climate zone details

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
            // Add other core sections like Compliance Pathway, Building Fabric if they are *not* converted to dynamic JSON
            // report.compliancePathway = await this.generateCompliancePathwayInfo(); // Example if kept
            // report.buildingFabric = this.generateBuildingFabricInfo(); // Example if kept

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

            // --- Dynamic JSON Sections ---
            report.dynamicSections = await this.generateDynamicSections();

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


    /**
     * Loads, filters, and processes dynamic sections defined in JSON files.
     * @returns {Promise<Array<Object>>} - Array of applicable, processed dynamic sections.
     */
    async generateDynamicSections() {
        const allSections = loadReportSections(); // Load all defined sections from JSON
        const applicableSections = [];

        // Use cached classification and zone
        const projectContext = {
            project: this.project,
            buildingClassification: this.buildingClassification,
            climateZone: this.climateZone,
        };

        for (const sectionDefinition of allSections) {
            // Check if section matches the requested sectionParam OR if 'full' report is requested
             if (this.sectionParam !== 'full' && this.sectionParam !== sectionDefinition.sectionId.toLowerCase()) {
                 continue; // Skip if a specific section is requested and this isn't it
             }

            // Check overall applicability
            if (this.checkApplicability(sectionDefinition.overallApplicability, projectContext)) {
                const processedSection = {
                    sectionId: sectionDefinition.sectionId,
                    title: sectionDefinition.title,
                    displayOrder: sectionDefinition.displayOrder || 999, // Default order
                    contentBlocks: [],
                     _sourceFile: sectionDefinition._sourceFile // Keep for debugging
                };

                // Process content blocks within the applicable section
                for (const block of sectionDefinition.contentBlocks) {
                    // Check block-specific applicability (if defined)
                    if (this.checkApplicability(block.blockApplicability || {}, projectContext)) { // Pass empty obj if null/undefined
                        // Process content (handle variants, table filtering etc.)
                        const processedBlock = this.processContentBlock(block, projectContext);
                        if (processedBlock) { // Ensure processing didn't return null
                            processedSection.contentBlocks.push(processedBlock);
                        }
                    }
                }

                // Only add the section if it has any applicable content blocks
                if (processedSection.contentBlocks.length > 0) {
                     applicableSections.push(processedSection);
                }
            }
        }

        // Sort sections by displayOrder
        applicableSections.sort((a, b) => a.displayOrder - b.displayOrder);

        return applicableSections;
    }

    /**
     * Checks if a given set of applicability rules match the project context.
     * **SIMPLIFIED VERSION:** Needs expansion for floor area, custom conditions etc.
     * @param {Object} rules - The applicability rules object (e.g., sectionDefinition.overallApplicability). Can be empty or null.
     * @param {Object} context - Project context containing project, classification, zone.
     * @returns {boolean} - True if the rules match, false otherwise.
     */
    checkApplicability(rules, context) {
         if (!rules || Object.keys(rules).length === 0) {
             return true; // No rules means it's always applicable (within its parent scope)
         }

        const { buildingClassification, climateZone, project } = context;

        // Check Building Class
        if (rules.buildingClasses && Array.isArray(rules.buildingClasses) && rules.buildingClasses.length > 0) {
            if (!buildingClassification || !rules.buildingClasses.includes(buildingClassification.classType)) {
                return false; // Class doesn't match
            }
        }

        // Check Climate Zone
        if (rules.climateZones && Array.isArray(rules.climateZones) && rules.climateZones.length > 0) {
            if (climateZone === null || !rules.climateZones.includes(climateZone)) { // Use cached numeric zone
                return false; // Zone doesn't match
            }
        }

        // --- TODO: Add more checks here ---
        // Check minFloorArea, maxFloorArea against project.floorArea
        // Check customConditions array against project properties

        return true; // All checks passed
    }

     /**
      * Processes a single content block, handling variants and potentially table filtering.
      * **SIMPLIFIED VERSION:** Needs expansion for variants, table filtering etc.
      * @param {Object} block - The content block definition from JSON.
      * @param {Object} context - Project context containing project, classification, zone.
      * @returns {Object | null} - The processed block ready for frontend, or null if invalid.
      */
     processContentBlock(block, context) {
         if (!block || !block.blockId || !block.contentType) {
             console.warn('Skipping invalid content block:', block);
             return null;
         }

         const processed = { ...block }; // Start with a copy

         // --- TODO: Implement Variant Logic ---
         // If block.variants exists:
         //  - Iterate through variants
         //  - Evaluate variant.condition against context (e.g., project.buildingClass, project.climateZone)
         //  - If condition matches, replace relevant fields in 'processed' (e.g., processed.value = variant.value)
         //  - Break after first match or handle multiple matches if needed
         //  - If no variant matches, use defaultValue or original block content if appropriate

         // --- TODO: Implement Table Row Filtering ---
         // If block.contentType === 'table' && block.filterRowsBy:
         //  - Get the property to filter by (e.g., 'climateZone') from block.filterRowsBy
         //  - Get the project's value for that property (e.g., context.climateZone)
         //  - Filter processed.rows to keep only rows where row[filterProperty] matches the project's value
         //    (Requires rows to be objects or have a predictable structure, e.g., first element is the zone)

         // Remove applicability rules before sending to frontend (optional)
         // delete processed.blockApplicability;
         // delete processed.variants;
         // delete processed.filterRowsBy;

         return processed;
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

    // --- Remove Old Generator Methods Now Handled Dynamically ---
    // Remove generateExemptionsInfo()
    // Remove generateEnergyUseInfo() - IF energy-use.json is standardized
    // Remove generateEnergyMonitoringInfo() - IF energy-monitoring.json is standardized
    // Remove generateElementalProvisionsJ3Info() - IF j3d4ceilingfan.json is standardized
    // Remove generateJ1P3EnergyUsageInfo() - IF j1p3-energy-usage.json is standardized
    // Remove generateJ1P4EVSEInfo() - IF j1p4-evse.json is standardized
    // Remove generateVerificationMethodsInfo() - IF verification-methods.json is standardized
    // Remove generateSpecialRequirementsInfo() - IF special-requirements.json is standardized
    // Remove generateJ3D3Requirements() - IF j3d3energyratesw.json covers this and is standardized
    // etc.

}

module.exports = ReportService;