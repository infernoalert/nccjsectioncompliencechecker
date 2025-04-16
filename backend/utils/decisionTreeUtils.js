const ClimateZone = require('../models/ClimateZone');
const decisionTree = require('../../Decision-Tree.json');

/**
 * Get building classification based on building type
 * @param {string} buildingType - The type of building
 * @returns {string} The building classification
 */
const getBuildingClassification = (buildingType) => {
  const classification = decisionTree.buildingClassifications[buildingType];
  if (!classification) {
    throw new Error(`Building classification not found for type: ${buildingType}`);
  }
  return classification;
};

/**
 * Get climate zone based on location
 * @param {string} location - The location of the building
 * @returns {Promise<Object>} The climate zone data
 */
const getClimateZoneByLocation = async (location) => {
  try {
    // First try to get from decision tree
    const climateZone = decisionTree.climateZones[location];
    if (climateZone) {
      return climateZone;
    }

    // If not in decision tree, try database
    const [state, region] = location.split('-');
    if (!state || !region) {
      throw new Error('Invalid location format. Expected format: "STATE-REGION"');
    }

    const dbClimateZone = await ClimateZone.findOne({
      state: state.toUpperCase(),
      region: region
    });

    if (!dbClimateZone) {
      throw new Error(`Climate zone not found for location: ${location}`);
    }

    return dbClimateZone;
  } catch (error) {
    throw new Error(`Error getting climate zone: ${error.message}`);
  }
};

/**
 * Get compliance pathway requirements
 * @param {string} buildingClassification - The building classification
 * @param {string} climateZone - The climate zone
 * @returns {Object} The compliance pathway requirements
 */
const getCompliancePathway = (buildingClassification, climateZone) => {
  const pathway = decisionTree.compliancePathways[buildingClassification]?.[climateZone];
  if (!pathway) {
    throw new Error(`Compliance pathway not found for ${buildingClassification} in ${climateZone}`);
  }
  return pathway;
};

/**
 * Get special requirements for a building
 * @param {string} buildingClassification - The building classification
 * @returns {Array} List of special requirements
 */
const getSpecialRequirements = (buildingClassification) => {
  const requirements = decisionTree.specialRequirements[buildingClassification];
  if (!requirements) {
    return [];
  }
  return requirements;
};

/**
 * Get climate zone requirements from the decision tree
 * @param {string} classType - The building class type (e.g., 'Class_5')
 * @param {string} zoneRange - The climate zone range (e.g., 'Zones_1_3')
 * @returns {Object|null} - The climate zone requirements or null if not found
 */
const getClimateZoneRequirements = (classType, zoneRange) => {
  const buildingClass = getBuildingClassification(classType);
  if (!buildingClass || !buildingClass.climate_zones) {
    return null;
  }
  
  return buildingClass.climate_zones[zoneRange] || null;
};

/**
 * Get compliance pathways from the decision tree
 * @param {string} classType - The building class type (e.g., 'Class_5')
 * @returns {Array|null} - The compliance pathways or null if not found
 */
const getCompliancePathways = (classType) => {
  const buildingClass = getBuildingClassification(classType);
  if (!buildingClass) {
    return null;
  }
  
  return buildingClass.compliance_pathways || null;
};

/**
 * Get exemptions from the decision tree
 * @param {Object} project - The project object
 * @returns {Array} - The applicable exemptions
 */
const getExemptions = (project) => {
  const exemptions = [];
  
  // Check minor use rule
  exemptions.push({
    name: 'Minor Use Rule',
    description: decisionTree.exemptions.minor_use_rule.threshold,
    excludedClasses: decisionTree.exemptions.minor_use_rule.excluded_classes
  });
  
  // Check heritage buildings
  exemptions.push({
    name: 'Heritage Buildings',
    conditions: decisionTree.exemptions.heritage_buildings.conditions,
    limitations: decisionTree.exemptions.heritage_buildings.limitations
  });
  
  return exemptions;
};

module.exports = {
  getBuildingClassification,
  getClimateZoneRequirements,
  getCompliancePathways,
  getSpecialRequirements,
  getExemptions,
  getClimateZoneByLocation,
  getCompliancePathway
}; 