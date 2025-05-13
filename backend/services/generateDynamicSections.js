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
    checkApplicability(rules, projectContext) {
        try {
            // Check building class applicability
            if (rules.buildingClasses && rules.buildingClasses.length > 0) {
                const projectClass = projectContext.buildingClassification?.classType;
                if (!projectClass || !rules.buildingClasses.includes(projectClass)) {
                    console.log(`Building class ${projectClass} not in allowed classes:`, rules.buildingClasses);
                    return false;
                }
            }

            // Check climate zone applicability
            if (rules.climateZones && rules.climateZones.length > 0) {
                const projectZone = projectContext.climateZone;
                if (!projectZone || !rules.climateZones.includes(projectZone)) {
                    console.log(`Climate zone ${projectZone} not in allowed zones:`, rules.climateZones);
                    return false;
                }
            }

            // Check floor area applicability
            if (projectContext.project?.floorArea !== undefined) {
                const floorArea = projectContext.project.floorArea;
                console.log('Checking floor area:', { floorArea, rules });

                // If both min and max are null/undefined, no floor area restrictions apply
                if ((rules.minFloorArea === null || rules.minFloorArea === undefined) && 
                    (rules.maxFloorArea === null || rules.maxFloorArea === undefined)) {
                    return true;
                }

                // Check minimum floor area
                if (rules.minFloorArea !== null && rules.minFloorArea !== undefined && floorArea < rules.minFloorArea) {
                    console.log(`Floor area ${floorArea} below minimum ${rules.minFloorArea}`);
                    return false;
                }

                // Check maximum floor area
                if (rules.maxFloorArea !== null && rules.maxFloorArea !== undefined && floorArea > rules.maxFloorArea) {
                    console.log(`Floor area ${floorArea} above maximum ${rules.maxFloorArea}`);
                    return false;
                }
            }

            // Check custom conditions if any
            if (rules.customConditions && rules.customConditions.length > 0) {
                for (const condition of rules.customConditions) {
                    const value = this.getPropertyValue(projectContext, condition.property);
                    if (!this.evaluateCondition(value, condition.operator, condition.value)) {
                        console.log(`Custom condition failed:`, condition);
                        return false;
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Error in checkApplicability:', error);
            return false;
        }
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
                        
                        // First, check if there are any exemption blocks
                        const exemptionBlocks = sectionData.contentBlocks.filter(block => 
                            block.blockId.toLowerCase().includes('exemption')
                        );
                        
                        // Process non-exemption blocks first
                        const regularBlocks = sectionData.contentBlocks.filter(block => 
                            !block.blockId.toLowerCase().includes('exemption')
                        );

                        // Process regular blocks
                        for (const block of regularBlocks) {
                            console.log(`Processing regular block ${block.blockId}:`, {
                                blockApplicability: block.blockApplicability,
                                floorArea: this.project?.floorArea
                            });
                            
                            const blockApplicable = this.checkApplicability(block.blockApplicability || {}, projectContext);
                            console.log(`Block ${block.blockId} applicability:`, blockApplicable);
                            
                            if (blockApplicable) {
                                const processedBlock = this.processContentBlock(block, projectContext);
                                if (processedBlock) {
                                    processedSection.contentBlocks.push(processedBlock);
                                }
                            }
                        }

                        // Process exemption blocks last
                        for (const block of exemptionBlocks) {
                            console.log(`Processing exemption block ${block.blockId}:`, {
                                blockApplicability: block.blockApplicability,
                                floorArea: this.project?.floorArea
                            });
                            
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