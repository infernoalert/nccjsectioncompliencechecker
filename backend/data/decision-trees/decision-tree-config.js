/**
 * Decision Tree Configuration
 * 
 * This file contains the configuration for the modular decision tree structure.
 */

module.exports = {
  // Base path for decision tree files
  basePath: 'data/decision-trees',
  
  // File extension for decision tree files
  fileExtension: '.json',
  
  // List of available sections
  sections: [
    'exemptions',
    'building-classifications',
    'climate-zones',
    'compliance-pathways',
    'special-requirements',
    'building-fabric',
    'energy-use',
    'verification-methods',
    'energy-monitoring',
    'ceilingfan-elemental-provisions-j3'
  ]
}; 