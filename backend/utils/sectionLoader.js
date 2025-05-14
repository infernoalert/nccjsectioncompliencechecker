// backend/utils/sectionLoader.js
const path = require('path');
const fs = require('fs').promises;

// Define the base directory containing all report sections
const baseDirectory = path.join(__dirname, '../data');

// Cache for different section types
const sectionCache = {
  'elemental-provisions': null,
  'j9Monitor': null,
  'j7lighting': null,
  'energy-efficiency': null,
  'fire-safety': null,
  // Add more section types as needed
};

/**
 * Load sections based on the selected type
 * @param {string} sectionType - The type of section to load (e.g., 'elemental-provisions', 'j9Monitor')
 * @returns {Promise<Object>} The loaded sections
 */
async function loadSections(sectionType) {
  try {
    // Check if we have cached data for this section type
    if (sectionCache[sectionType]) {
      return sectionCache[sectionType];
    }

    // Validate section type
    if (!sectionType || !sectionCache.hasOwnProperty(sectionType)) {
      throw new Error(`Invalid section type: ${sectionType}`);
    }

    const sectionDirectory = path.join(baseDirectory, sectionType);
    
    // Check if directory exists
    try {
      await fs.access(sectionDirectory);
    } catch (error) {
      throw new Error(`Section directory not found: ${sectionType}`);
    }

    // Read all JSON files in the directory
    const files = await fs.readdir(sectionDirectory);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const sections = {};
    for (const file of jsonFiles) {
      const filePath = path.join(sectionDirectory, file);
      const content = await fs.readFile(filePath, 'utf8');
      const sectionName = path.basename(file, '.json');
      sections[sectionName] = JSON.parse(content);
    }

    // Cache the loaded sections
    sectionCache[sectionType] = sections;
    return sections;
  } catch (error) {
    console.error(`Error loading sections for ${sectionType}:`, error);
    throw error;
  }
}

/**
 * Clear the cache for a specific section type or all sections
 * @param {string} [sectionType] - Optional section type to clear. If not provided, clears all caches
 */
function clearCache(sectionType) {
  if (sectionType) {
    sectionCache[sectionType] = null;
  } else {
    Object.keys(sectionCache).forEach(key => {
      sectionCache[key] = null;
    });
  }
}

module.exports = {
  loadSections,
  clearCache
};
