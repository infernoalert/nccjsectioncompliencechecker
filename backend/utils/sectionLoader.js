// backend/utils/sectionLoader.js
const fs = require('fs');
const path = require('path');

// Define the directory containing the standardized JSON report sections
// Using the user-specified directory. Consider moving standardized JSONs
// to a dedicated 'report-sections' subdir for clarity.
const sectionsDirectory = path.join(__dirname, '../data/elemental-provisions');

let cachedSections = null; // Simple in-memory cache

/**
 * Loads and parses all standardized JSON files from the sections directory.
 * Includes basic validation for required fields in the standard format.
 * Caches the result to avoid repeated file reads.
 * @returns {Array<Object>} An array of valid report section definition objects.
 */
const loadReportSections = () => {
    // Return cached data if available
    if (cachedSections !== null) {
        return cachedSections;
    }

    const loadedSections = [];
    try {
        const files = fs.readdirSync(sectionsDirectory);

        files.forEach(file => {
            // Process only JSON files
            if (path.extname(file).toLowerCase() === '.json') {
                const filePath = path.join(sectionsDirectory, file);
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const sectionData = JSON.parse(fileContent);

                    // Basic validation for standard format structure
                    if (sectionData && sectionData.sectionId && sectionData.title && sectionData.overallApplicability && Array.isArray(sectionData.contentBlocks)) {
                         // Add filePath for potential debugging
                         sectionData._sourceFile = file;
                         loadedSections.push(sectionData);
                    } else {
                        // Optionally log files that don't match the expected base structure
                        // console.warn(`Skipping file ${file}: Does not appear to be a valid standard report section JSON.`);
                    }
                } catch (parseError) {
                    console.error(`Error parsing JSON file ${file}:`, parseError.message);
                    // Skip files that fail to parse
                }
            }
        });
    } catch (readDirError) {
        console.error(`Error reading sections directory ${sectionsDirectory}:`, readDirError);
        // Depending on requirements, might want to throw error or return empty array
        return [];
    }

    // Cache the loaded sections
    cachedSections = loadedSections;
    // console.log(`Loaded ${cachedSections.length} report sections from JSON.`);
    return cachedSections;
};

/**
 * Clears the section cache. Useful for development environments
 * where JSON files might change without restarting the server.
 */
const clearSectionCache = () => {
    cachedSections = null;
};

module.exports = {
    loadReportSections,
    clearSectionCache, // Export if needed for development/testing
};