// backend/services/LightingPowerReportService.js

const { loadSections } = require('../utils/sectionLoader');
const { getBuildingClassification, getClimateZoneByLocation } = require('../utils/decisionTreeUtils');

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
        this.allLightingPowerSectionDefinitions = []; // Stores raw definitions for lighting/power

        console.log(`LightingPowerReportService: Instantiated for project ID ${this.project._id}`);
    }

    /**
     * Initializes essential data for report generation.
     */
    async initialize() {
        console.log("LightingPowerReportService: Initializing...");
        try {
            if (this.project.buildingType) {
                this.buildingClassification = await getBuildingClassification(this.project.buildingType);
                console.log("LightingPowerReportService: Fetched Building Classification:", this.buildingClassification ? this.buildingClassification.classType : 'Not found');
            } else {
                console.warn("LightingPowerReportService: Project buildingType is undefined.");
            }

            if (this.project.location) {
                this.climateZone = await getClimateZoneByLocation(this.project.location);
                console.log("LightingPowerReportService: Fetched Climate Zone:", this.climateZone);
            } else {
                console.warn("LightingPowerReportService: Project location is undefined.");
            }

            // Assuming loadSections() loads ALL sections from all known data directories.
            // We then filter by category.
            const sections = await loadSections('lighting-power');
            if (!sections || Object.keys(sections).length === 0) {
                console.warn("LightingPowerReportService: loadSections() returned no sections or an empty object.");
                this.allLightingPowerSectionDefinitions = [];
            } else {
                console.log(`LightingPowerReportService: Loaded sections from ${Object.keys(sections).length} files.`);
                this.allLightingPowerSectionDefinitions = Object.values(sections).filter(section => {
                    // CRITICAL: Ensure your JSON files in 'backend/data/lighting-power/'
                    // have a "category": "lighting-power" field.
                    return section.category === 'lighting-power';
                });
            }

            console.log(`LightingPowerReportService: Filtered down to ${this.allLightingPowerSectionDefinitions.length} lighting/power specific section definitions.`);
            if (this.allLightingPowerSectionDefinitions.length === 0) {
                console.warn("LightingPowerReportService: No section definitions found for category 'lighting-power'. Check JSON files and their 'category' field in 'backend/data/lighting-power/'.");
            }

        } catch (error) {
            console.error('Error during LightingPowerReportService initialization:', error);
            // Propagate the error so the controller's try-catch can handle it, leading to a 500 response.
            throw new Error(`Initialization failed: ${error.message}`);
        }
        console.log("LightingPowerReportService: Initialization complete.");
    }

    /**
     * Generate lighting & power compliance report.
     * @returns {Promise<Object>} The generated lighting & power report.
     */
    async generateReport() {
        console.log("LightingPowerReportService: Starting report generation...");
        try {
            await this.initialize();

            // Load the lighting-power sections
            const sections = await loadSections('lighting-power');

            const report = {
                projectInfo: {
                    name: this.project.name,
                    buildingType: this.project.buildingType,
                    location: this.project.location,
                    floorArea: this.project.floorArea
                },
                lightingPowerReport: {
                    status: 'in_progress',
                    message: 'Lighting & power report is being generated',
                    sections: {
                        lighting: {
                            status: 'in_progress',
                            message: 'Lighting calculations in progress',
                            requirements: sections.lighting?.requirements || [],
                            compliance: 'pending'
                        },
                        power: {
                            status: 'in_progress',
                            message: 'Power calculations in progress',
                            requirements: sections.power?.requirements || [],
                            compliance: 'pending'
                        }
                    }
                }
            };
            
            // Determine overall status based on the compliance of individual sections
            if (sections && sections.length > 0) {
                if (sections.every(section => section.complianceStatus === 'compliant')) {
                    report.lightingPowerReport.status = 'compliant';
                } else if (sections.some(section => section.complianceStatus === 'non-compliant')) {
                    report.lightingPowerReport.status = 'non-compliant';
                }
                // If sections exist but none are non-compliant and not all are compliant, it remains 'pending'
            } else {
                // If there are no sections, the overall status might be 'not-applicable' or 'pending'
                // depending on business rules. For now, let's keep it 'pending' or set to 'not-applicable'.
                report.lightingPowerReport.status = 'not-applicable'; // Or 'pending'
                console.log("LightingPowerReportService: No lighting/power sections generated, overall status set to not-applicable.");
            }
            
            console.log("LightingPowerReportService: Report generation successful.");
            return report;

        } catch (error) {
            console.error('Error generating lighting & power report:', error.stack); // Log stack for more details
            // This error will be caught by the asyncHandler in the controller, leading to a 500.
            return {
                projectInfo: {
                    name: this.project.name,
                    buildingType: this.project.buildingType,
                    location: this.project.location,
                    floorArea: this.project.floorArea
                },
                lightingPowerReport: {
                    status: 'error',
                    message: `Error generating report: ${error.message}`,
                    sections: {
                        lighting: {
                            status: 'error',
                            message: 'Failed to generate lighting calculations',
                            requirements: [],
                            compliance: 'error'
                        },
                        power: {
                            status: 'error',
                            message: 'Failed to generate power calculations',
                            requirements: [],
                            compliance: 'error'
                        }
                    }
                }
            };
        }
    }

    /**
     * Checks if a section definition is applicable based on the project context.
     * @param {Object} rules - The applicability rules from the section definition.
     * @param {Object} context - The project context (project, buildingClassification, climateZone).
     * @returns {boolean} - True if applicable, false otherwise.
     */
    checkApplicability(rules, context) {
        if (!rules || Object.keys(rules).length === 0) {
            return true; // No rules means it's always applicable
        }

        const { buildingClassification, climateZone, project } = context;

        // Check Building Class
        if (rules.buildingClasses && Array.isArray(rules.buildingClasses) && rules.buildingClasses.length > 0) {
            if (!buildingClassification || !rules.buildingClasses.includes(buildingClassification.classType)) {
                return false;
            }
        }

        // Check Climate Zone
        if (rules.climateZones && Array.isArray(rules.climateZones) && rules.climateZones.length > 0) {
            if (climateZone === null || !rules.climateZones.includes(climateZone)) { // climateZone is numeric
                return false;
            }
        }
        
        // Example: Check against project floor area
        if (rules.minFloorArea && project.floorArea < rules.minFloorArea) {
            return false;
        }
        if (rules.maxFloorArea && project.floorArea > rules.maxFloorArea) {
            return false;
        }

        // Example: Check against custom conditions (requires project object to have these properties)
        if (rules.customConditions && Array.isArray(rules.customConditions)) {
            for (const condition of rules.customConditions) {
                // Example: condition could be "project.hasSwimmingPool === true"
                // This requires careful parsing or a more structured condition object
                // For simplicity, let's assume customConditions are simple property checks for now
                // e.g., rules.customConditions = [{ property: "hasSwimmingPool", expectedValue: true }]
                if (condition.property && project[condition.property] !== condition.expectedValue) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Processes a single content block from a section definition.
     * This might involve selecting variants, filtering table data, or substituting values.
     * @param {Object} block - The content block definition.
     * @param {Object} context - The project context.
     * @returns {Object | null} - The processed block or null if it's not applicable/invalid.
     */
    processContentBlock(block, context) {
        if (!block || !block.blockId || !block.contentType) {
            console.warn('LightingPowerReportService: Skipping invalid content block:', block);
            return null;
        }

        // First, check block-specific applicability
        if (!this.checkApplicability(block.blockApplicability || {}, context)) {
            return null; // Block is not applicable
        }
        
        const processedBlock = { ...block }; // Start with a copy, remove applicability rules later if desired

        // --- TODO: Implement Variant Logic ---
        // Example:
        // if (block.variants && Array.isArray(block.variants)) {
        //     for (const variant of block.variants) {
        //         if (this.checkApplicability(variant.condition || {}, context)) {
        //             Object.assign(processedBlock, variant.content); // Merge variant content
        //             break; // Apply first matching variant
        //         }
        //     }
        // }

        // --- TODO: Implement Table Row Filtering (if applicable for lighting/power) ---
        // Example:
        // if (processedBlock.contentType === 'table' && processedBlock.filterRowsBy) {
        //     const filterKey = processedBlock.filterRowsBy.key; // e.g., "climateZone"
        //     const projectValue = context[filterKey]; // e.g., context.climateZone (numeric)
        //     if (processedBlock.rows && projectValue !== undefined) {
        //         processedBlock.rows = processedBlock.rows.filter(row => {
        //             // Assuming the row data has a comparable property, or the filter logic is defined in filterRowsBy
        //             return row[filterKey] === projectValue;
        //         });
        //     }
        // }
        
        // --- TODO: Implement Value Substitution & Actual Calculations ---
        // This is where you'd calculate specific values for lighting/power.
        // For example, if a block's value is a placeholder like "{{calculated_lighting_density}}",
        // you would replace it here.
        // Or, if a value needs to be derived:
        // if (block.calculationRule === 'calculateLightingPowerDensity') {
        //    processedBlock.value = calculateLPD(context.project, context.buildingClassification);
        //    processedBlock.unit = 'W/m²';
        // }


        // Placeholder for compliance status for the block. This needs to be determined by actual checks.
        // For example, if a calculated value exceeds a limit from the rules.
        processedBlock.compliance = 'pending'; // This would be 'compliant', 'non-compliant', or 'not-applicable'

        // Clean up rules from the final block if they are not needed in the frontend
        // delete processedBlock.blockApplicability;
        // delete processedBlock.variants;
        // delete processedBlock.filterRowsBy;

        return processedBlock;
    }

    /**
     * Generates the dynamic sections of the lighting and power report
     * based on loaded JSON configurations.
     * @returns {Promise<Array<Object>>} - An array of processed report sections.
     */
    async generateDynamicSections() {
        console.log("LightingPowerReportService: Generating dynamic sections...");
        const applicableReportSections = [];
        const projectContext = {
            project: this.project,
            buildingClassification: this.buildingClassification,
            climateZone: this.climateZone,
        };

        let sectionsToProcess = this.allLightingPowerSectionDefinitions;

        console.log(`LightingPowerReportService: Processing ${sectionsToProcess.length} section definitions for this report.`);
        if (sectionsToProcess.length === 0) {
            console.warn("LightingPowerReportService: No 'lighting-power' category sections were loaded initially.");
            // Return empty array if no sections are to be processed.
            return [];
        }

        for (const sectionDefinition of sectionsToProcess) {
            console.log(`LightingPowerReportService: Checking applicability for section: ${sectionDefinition.sectionId}`);
            if (this.checkApplicability(sectionDefinition.overallApplicability || {}, projectContext)) {
                console.log(`LightingPowerReportService: Section ${sectionDefinition.sectionId} is applicable.`);
                const processedSection = {
                    sectionId: sectionDefinition.sectionId,
                    title: sectionDefinition.title,
                    displayOrder: sectionDefinition.displayOrder || 999,
                    contentBlocks: [],
                    complianceStatus: 'pending', // Default status for the section
                    // _sourceFile: sectionDefinition._sourceFile // Optional: for debugging
                };

                let allBlocksCompliant = true;
                let anyBlockNonCompliant = false;
                let hasRelevantBlocks = false; // Track if any blocks were processed for this section

                if (sectionDefinition.contentBlocks && Array.isArray(sectionDefinition.contentBlocks)) {
                    for (const block of sectionDefinition.contentBlocks) {
                        const processedBlock = this.processContentBlock(block, projectContext);
                        if (processedBlock) {
                            hasRelevantBlocks = true;
                            processedSection.contentBlocks.push(processedBlock);
                            
                            // Determine section compliance based on block compliance
                            if (processedBlock.compliance === 'non-compliant') {
                                anyBlockNonCompliant = true;
                                allBlocksCompliant = false; 
                            } else if (processedBlock.compliance !== 'compliant') {
                                // If any block is pending or not-applicable (but was processed),
                                // the section isn't fully compliant yet.
                                allBlocksCompliant = false;
                            }
                        }
                    }
                } else {
                    console.warn(`LightingPowerReportService: Section ${sectionDefinition.sectionId} has no contentBlocks array or it's empty.`);
                }


                // Add section if it has content or if it's flagged to always show
                if (processedSection.contentBlocks.length > 0 || (sectionDefinition.alwaysShowEvenIfEmpty === true)) {
                    if (anyBlockNonCompliant) {
                        processedSection.complianceStatus = 'non-compliant';
                    } else if (allBlocksCompliant && hasRelevantBlocks) { 
                        processedSection.complianceStatus = 'compliant';
                    } else if (!hasRelevantBlocks && sectionDefinition.defaultStatusIfEmpty) {
                        // If no blocks were relevant, use a default status if defined
                        processedSection.complianceStatus = sectionDefinition.defaultStatusIfEmpty; 
                    } else { 
                        // Remains 'pending' if blocks are pending or if all were N/A but no default status
                        processedSection.complianceStatus = 'pending';
                    }
                    applicableReportSections.push(processedSection);
                } else {
                    console.log(`LightingPowerReportService: Section ${sectionDefinition.sectionId} had no applicable/processed content blocks and will not be added (unless alwaysShowEvenIfEmpty is true).`);
                }
            } else {
                 console.log(`LightingPowerReportService: Section ${sectionDefinition.sectionId} is NOT applicable based on overall rules.`);
            }
        }

        applicableReportSections.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
        console.log(`LightingPowerReportService: Finished generating dynamic sections. ${applicableReportSections.length} sections included in the report.`);
        return applicableReportSections;
    }
}

module.exports = LightingPowerReportService;
