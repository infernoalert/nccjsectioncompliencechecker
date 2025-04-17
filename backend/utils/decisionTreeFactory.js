/**
 * Decision Tree Factory
 * 
 * This module provides a factory function for loading decision tree sections.
 * It handles loading the appropriate decision tree based on the configuration.
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../data/decision-trees/decision-tree-config');

// Cache for loaded decision tree sections
const sectionCache = {};

// Cache for the monolithic tree
let monolithicTreeCache = null;

/**
 * Loads a decision tree section from the modular structure
 * @param {string} section - The section to load
 * @returns {Promise<Object>} The loaded section
 */
async function loadModularSection(section) {
  // Check if the section is already in the cache
  if (sectionCache[section]) {
    return sectionCache[section];
  }

  // Construct the path to the section file
  const sectionPath = path.join(__dirname, '..', config.basePath, `${section}${config.fileExtension}`);

  try {
    // Check if the file exists
    await fs.access(sectionPath);
    
    // Read and parse the section file
    const sectionData = JSON.parse(await fs.readFile(sectionPath, 'utf8'));
    
    // Cache the section data
    sectionCache[section] = sectionData;
    
    return sectionData;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return null to allow fallback
      return null;
    }
    // For other errors, log and throw
    console.error(`Error loading section ${section}:`, error);
    throw error;
  }
}

/**
 * Loads the monolithic decision tree from the JSON file
 * @returns {Promise<Object>} The decision tree object
 */
async function loadMonolithicTree() {
    // Return cached tree if available
    if (monolithicTreeCache) {
        return monolithicTreeCache;
    }

    try {
        const treePath = path.join(__dirname, '..', 'data', 'Decision-Tree.json');
        const treeData = await fs.readFile(treePath, 'utf8');
        monolithicTreeCache = JSON.parse(treeData);
        return monolithicTreeCache;
    } catch (error) {
        console.error('Error loading monolithic decision tree:', error);
        throw new Error('Failed to load decision tree');
    }
}

/**
 * Gets a specific section from the decision tree
 * @param {string} sectionName - The name of the section to retrieve
 * @returns {Promise<Object>} The section data
 */
async function getSection(sectionName) {
    try {
        // First try to load from modular structure
        const modularSection = await loadModularSection(sectionName);
        if (modularSection) {
            return modularSection;
        }

        // Fall back to monolithic tree
        const tree = await loadMonolithicTree();
        
        // Check if the section exists at the root level (for exemptions)
        if (tree[sectionName]) {
            return tree[sectionName];
        }
        
        // Check if the section exists in the decision_tree object
        if (tree.decision_tree && tree.decision_tree[sectionName]) {
            return tree.decision_tree[sectionName];
        }
        
        // If the section doesn't exist in either structure, return null
        console.warn(`Section '${sectionName}' not found in either modular or monolithic structure`);
        return null;
    } catch (error) {
        console.error(`Error getting section ${sectionName}:`, error);
        throw error;
    }
}

/**
 * Gets multiple sections from the decision tree
 * @param {string[]} sectionNames - Array of section names to retrieve
 * @returns {Promise<Object>} Object containing the requested sections
 */
async function getSections(sectionNames) {
    try {
        const sections = {};
        
        for (const name of sectionNames) {
            sections[name] = await getSection(name);
        }
        
        return sections;
    } catch (error) {
        console.error('Error getting sections:', error);
        throw error;
    }
}

/**
 * Gets all sections from the decision tree
 * @returns {Promise<Object>} All sections from the decision tree
 */
async function getAllSections() {
    try {
        const tree = await loadMonolithicTree();
        // Remove metadata fields
        const { version, lastUpdated, ...sections } = tree;
        return sections;
    } catch (error) {
        console.error('Error getting all sections:', error);
        throw error;
    }
}

module.exports = {
  getSection,
  getSections,
  getAllSections,
  loadModularSection,
  loadMonolithicTree
}; 