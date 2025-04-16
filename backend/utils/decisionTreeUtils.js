const decisionTree = require('../data/Decision-Tree.json');

/**
 * Get building classification details from the decision tree
 * @param {string} classType - The building class type (e.g., 'Class_5')
 * @returns {Object|null} - The building classification details or null if not found
 */
const getBuildingClassification = (classType) => {
  return decisionTree.decision_tree.building_classification[classType] || null;
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
 * Get special requirements from the decision tree
 * @param {Object} project - The project object
 * @returns {Array} - The applicable special requirements
 */
const getSpecialRequirements = (project) => {
  const specialRequirements = [];
  
  // Check renewable energy requirements
  if (project.floorArea > 55) {
    specialRequirements.push({
      name: 'Renewable Energy',
      trigger: 'roof_area > 55m²',
      requirements: decisionTree.decision_tree.special_requirements.renewable_energy.requirements
    });
  }
  
  // Check EV charging requirements
  // This is a simplified example - in a real implementation, you would check the actual carpark size
  if (project.floorArea > 1000) { // Assuming larger buildings have more parking
    specialRequirements.push({
      name: 'EV Charging',
      trigger: 'carpark >= 10 spaces/storey',
      requirements: decisionTree.decision_tree.special_requirements.ev_charging.requirements
    });
  }
  
  return specialRequirements;
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
  getExemptions
}; 