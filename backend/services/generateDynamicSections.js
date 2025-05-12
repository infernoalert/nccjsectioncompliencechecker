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
            if (!buildingClassification || !rules.buildingClasses.includes(buildingClassification.classType)) {
                return false; // Class doesn't match
            }
        }

        // Check Climate Zone
        if (rules.climateZones && Array.isArray(rules.climateZones) && rules.climateZones.length > 0) {
            if (climateZone === null || !rules.climateZones.includes(climateZone)) {
                return false; // Zone doesn't match
            }
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
            const allSections = await loadSections(this.sectionType);
            const applicableSections = [];

            const projectContext = {
                project: this.project,
                buildingClassification: this.buildingClassification,
                climateZone: this.climateZone,
            };

            // Process each section in the loaded data
            for (const [sectionId, sectionData] of Object.entries(allSections)) {
                if (this.sectionParam !== 'full' && this.sectionParam !== sectionId.toLowerCase()) {
                    continue;
                }

                if (this.checkApplicability(sectionData.overallApplicability || {}, projectContext)) {
                    const processedSection = {
                        sectionId: sectionId,
                        title: sectionData.title || sectionId,
                        displayOrder: sectionData.displayOrder || 999,
                        contentBlocks: [],
                        _sourceFile: sectionData._sourceFile
                    };

                    if (sectionData.contentBlocks && Array.isArray(sectionData.contentBlocks)) {
                        for (const block of sectionData.contentBlocks) {
                            if (this.checkApplicability(block.blockApplicability || {}, projectContext)) {
                                const processedBlock = this.processContentBlock(block, projectContext);
                                if (processedBlock) {
                                    processedSection.contentBlocks.push(processedBlock);
                                }
                            }
                        }
                    }

                    if (processedSection.contentBlocks.length > 0) {
                        applicableSections.push(processedSection);
                    }
                }
            }

            // Sort sections by displayOrder
            applicableSections.sort((a, b) => a.displayOrder - b.displayOrder);

            return applicableSections;
        } catch (error) {
            console.error('Error in generateDynamicSections:', error);
            throw new Error(`Failed to generate dynamic sections: ${error.message}`);
        }
    }
}

module.exports = DynamicSectionsGenerator; 