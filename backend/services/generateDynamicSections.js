const { loadSections } = require('../utils/sectionLoader.js');

class DynamicSectionsGenerator {
    constructor(project, sectionParam, buildingClassification, climateZone, sectionType) {
        this.project = project;
        this.sectionParam = sectionParam ? sectionParam.toLowerCase() : 'full';
        this.buildingClassification = buildingClassification;
        this.climateZone = climateZone;
        this.sectionType = sectionType;
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
     * Checks if a given set of applicability rules match the project context.
     * @param {Object} rules - The applicability rules object
     * @param {Object} context - Project context containing project, classification, zone.
     * @returns {boolean} - True if the rules match, false otherwise.
     */
    checkApplicability(rules, context) {
        if (!rules || Object.keys(rules).length === 0) {
            return true; // No rules means it's always applicable
        }

        const { buildingClassification, climateZone, project } = context;

        // Check Building Class
        if (rules.buildingClasses && Array.isArray(rules.buildingClasses) && rules.buildingClasses.length > 0) {
            // If no building class is specified, assume it's applicable
            if (!buildingClassification || !buildingClassification.classType) {
                console.log('Building classification not specified, assuming applicable');
                return true;
            }
            if (!rules.buildingClasses.includes(buildingClassification.classType)) {
                console.log(`Building class ${buildingClassification.classType} not in allowed classes:`, rules.buildingClasses);
                return false;
            }
        }

        // Check Climate Zone
        if (rules.climateZones && Array.isArray(rules.climateZones) && rules.climateZones.length > 0) {
            // If no climate zone is specified, assume it's applicable
            if (climateZone === null || climateZone === undefined) {
                console.log('Climate zone not specified, assuming applicable');
                return true;
            }
            // Convert both to strings for comparison
            const zoneStr = String(climateZone);
            if (!rules.climateZones.includes(zoneStr)) {
                console.log(`Climate zone ${zoneStr} not in allowed zones:`, rules.climateZones);
                return false;
            }
        }

        // Check Floor Area
        if (project && project.floorArea !== undefined) {
            const floorArea = parseFloat(project.floorArea);
            
            if (isNaN(floorArea)) {
                console.log('Floor area is not a valid number');
                return false;
            }

            // Handle floor area ranges
            if (rules.minFloorArea !== null && rules.maxFloorArea !== null) {
                // Handles a defined range: min <= area < max
                const minArea = parseFloat(rules.minFloorArea);
                const maxArea = parseFloat(rules.maxFloorArea);
                if (isNaN(minArea) || isNaN(maxArea)) {
                    console.log('Invalid min/max floor area values');
                    return false;
                }
                if (!(floorArea >= minArea && floorArea < maxArea)) {
                    console.log(`Floor area ${floorArea} not in range [${minArea}, ${maxArea})`);
                    return false;
                }
            } else if (rules.minFloorArea !== null) {
                // Handles only a minimum: area >= min
                const minArea = parseFloat(rules.minFloorArea);
                if (isNaN(minArea)) {
                    console.log('Invalid min floor area value');
                    return false;
                }
                if (floorArea < minArea) {
                    console.log(`Floor area ${floorArea} less than minimum ${minArea}`);
                    return false;
                }
            } else if (rules.maxFloorArea !== null) {
                // Handles only a maximum: area < max
                const maxArea = parseFloat(rules.maxFloorArea);
                if (isNaN(maxArea)) {
                    console.log('Invalid max floor area value');
                    return false;
                }
                if (floorArea >= maxArea) {
                    console.log(`Floor area ${floorArea} greater than or equal to maximum ${maxArea}`);
                    return false;
                }
            }
        } else if (rules.minFloorArea !== null || rules.maxFloorArea !== null) {
            console.log('Floor area rules exist but project floor area is not defined');
            return false;
        }

        return true; // All checks passed
    }

    /**
     * Processes a single content block, handling variants and potentially table filtering.
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

        // TODO: Implement Variant Logic
        // TODO: Implement Table Row Filtering

        return processed;
    }

    /**
     * Loads, filters, and processes dynamic sections defined in JSON files.
     * @returns {Promise<Array<Object>>} - Array of applicable, processed dynamic sections.
     */
    async generateDynamicSections() {
        try {
            console.log('Loading sections for type:', this.sectionType);
            const allSections = await loadSections(this.sectionType);
            console.log('Loaded sections:', Object.keys(allSections));
            const applicableSections = [];

            const projectContext = {
                project: this.project,
                buildingClassification: this.buildingClassification,
                climateZone: this.climateZone,
            };
            console.log('Project context:', {
                buildingClass: this.buildingClassification?.classType,
                climateZone: this.climateZone,
                floorArea: this.project?.floorArea
            });

            // Process each section in the loaded data
            for (const [sectionId, sectionData] of Object.entries(allSections)) {
                console.log(`Processing section ${sectionId}:`, {
                    sectionParam: this.sectionParam,
                    sectionId: sectionId.toLowerCase(),
                    overallApplicability: sectionData.overallApplicability
                });

                if (this.sectionParam !== 'full' && this.sectionParam !== sectionId.toLowerCase()) {
                    console.log(`Skipping section ${sectionId} - doesn't match sectionParam`);
                    continue;
                }

                const isApplicable = this.checkApplicability(sectionData.overallApplicability || {}, projectContext);
                console.log(`Section ${sectionId} applicability:`, isApplicable);

                if (isApplicable) {
                    const processedSection = {
                        sectionId: sectionId,
                        title: sectionData.title || sectionId,
                        displayOrder: sectionData.displayOrder || 999,
                        contentBlocks: [],
                        _sourceFile: sectionData._sourceFile
                    };

                    if (sectionData.contentBlocks && Array.isArray(sectionData.contentBlocks)) {
                        console.log(`Processing ${sectionData.contentBlocks.length} content blocks for section ${sectionId}`);
                        for (const block of sectionData.contentBlocks) {
                            const blockApplicable = this.checkApplicability(block.blockApplicability || {}, projectContext);
                            console.log(`Block ${block.blockId} applicability:`, blockApplicable);
                            
                            if (blockApplicable) {
                                const processedBlock = this.processContentBlock(block, projectContext);
                                if (processedBlock) {
                                    processedSection.contentBlocks.push(processedBlock);
                                }
                            }
                        }
                    }

                    if (processedSection.contentBlocks.length > 0) {
                        applicableSections.push(processedSection);
                    } else {
                        console.log(`Section ${sectionId} has no applicable content blocks`);
                    }
                }
            }

            // Sort sections by displayOrder
            applicableSections.sort((a, b) => a.displayOrder - b.displayOrder);
            console.log('Final applicable sections:', applicableSections.map(s => s.sectionId));

            return applicableSections;
        } catch (error) {
            console.error('Error in generateDynamicSections:', error);
            throw new Error(`Failed to generate dynamic sections: ${error.message}`);
        }
    }
}

module.exports = DynamicSectionsGenerator; 