const ClimateZone = require('../models/ClimateZone');
const decisionTree = require('../../Decision-Tree.json');
const locationToClimateZone = require('../data/mappings/locationToClimateZone.json');
const { getSection } = require('./decisionTreeFactory');
const fs = require('fs');
const path = require('path');

// Load mapping data
const buildingTypeMapping = require('../data/mappings/buildingTypeToClassification.json');
const buildingClassifications = require('../data/decision-trees/building-classifications.json');

// Valid building class types
const VALID_BUILDING_CLASSES = [
  'Class_1a',
  'Class_1b',
  'Class_2',
  'Class_3',
  'Class_4',
  'Class_5',
  'Class_6',
  'Class_7a',
  'Class_7b',
  'Class_8',
  'Class_9a',
  'Class_9b',
  'Class_9c'
];

/**
 * Validates if a building class type is valid
 * @param {string} classType - The building class type to validate
 * @returns {boolean} - Whether the class type is valid
 */
const isValidBuildingClass = (classType) => {
  return VALID_BUILDING_CLASSES.includes(classType);
};

/**
 * Get building classification based on building type
 * @param {string} buildingType - The type of building
 * @returns {Object} The building classification details
 */
const getBuildingClassification = (buildingType) => {
  try {
    // First, get the NCC classification from the mapping
    const buildingTypeInfo = buildingTypeMapping.buildingTypes.find(type => type.id === buildingType);
    if (!buildingTypeInfo) {
      throw new Error(`Building type not found: ${buildingType}`);
    }

    // Then, get the detailed classification information
    const classificationInfo = buildingClassifications.building_classifications.find(
      classification => classification.id === buildingTypeInfo.nccClassification
    );

    if (!classificationInfo) {
      throw new Error(`Classification details not found for: ${buildingTypeInfo.nccClassification}`);
    }

    // Return combined information
    return {
      classType: buildingTypeInfo.nccClassification,
      name: buildingTypeInfo.name,
      description: buildingTypeInfo.description,
      typicalUse: buildingTypeInfo.typicalUse,
      commonFeatures: buildingTypeInfo.commonFeatures,
      notes: buildingTypeInfo.notes,
      technicalDetails: {
        description: classificationInfo.description,
        typicalUse: classificationInfo.typicalUse,
        commonFeatures: classificationInfo.commonFeatures,
        notes: classificationInfo.notes
      }
    };
  } catch (error) {
    console.error('Error in getBuildingClassification:', error);
    throw error;
  }
};

/**
 * Get climate zone based on location
 * @param {string} location - The location of the building
 * @returns {string} The climate zone
 */
const getClimateZoneByLocation = (location) => {
  try {
    // Find the location in the mapping file
    const locationData = locationToClimateZone.locations.find(loc => loc.id === location);
    
    if (!locationData) {
      throw new Error(`Location not found: ${location}`);
    }
    
    // Return the climate zone
    return locationData.climateZone;
  } catch (error) {
    throw new Error(`Error getting climate zone: ${error.message}`);
  }
};

/**
 * Get compliance pathway requirements
 * @param {string} buildingClassification - The building classification
 * @param {string} climateZone - The climate zone
 * @returns {Promise<Object>} The compliance pathway requirements
 */
const getCompliancePathway = async (buildingClassification, climateZone) => {
  try {
    // Validate building class type
    if (!isValidBuildingClass(buildingClassification)) {
      throw new Error(`Invalid building class type: ${buildingClassification}`);
    }

    // Get compliance pathways from the modular structure
    const pathwaysData = await getSection('compliancePathways');
    if (!pathwaysData || !pathwaysData.compliancePathways) {
      throw new Error('No compliance pathways data found');
    }

    const pathways = pathwaysData.compliancePathways[buildingClassification];
    if (!pathways) {
      throw new Error(`No compliance pathways found for building class: ${buildingClassification}`);
    }

    // Determine which zone range the climate zone falls into
    const zoneRange = climateZone <= 3 ? 'Zones_1_3' : 'Zones_4_8';
    const pathway = pathways[zoneRange];
    
    if (!pathway) {
      throw new Error(`No compliance pathway found for ${buildingClassification} in ${zoneRange}`);
    }

    return pathway;
  } catch (error) {
    console.error(`Error getting compliance pathway for ${buildingClassification} in ${climateZone}:`, error);
    throw error;
  }
};

/**
 * Get special requirements for a building
 * @param {string} buildingClassification - The building classification
 * @returns {Promise<Array>} List of special requirements
 */
const getSpecialRequirements = async (buildingClassification) => {
  try {
    // Get special requirements from the modular structure
    const specialRequirementsData = await getSection('special-requirements');
    if (!specialRequirementsData || !specialRequirementsData.special_requirements) {
      throw new Error('No special requirements data found');
    }

    // Get all requirements
    const allRequirements = specialRequirementsData.special_requirements;
    
    // Filter requirements based on building classification and triggers
    const applicableRequirements = Object.entries(allRequirements)
      .map(([key, requirement]) => ({
        id: key,
        ...requirement
      }))
      .filter(requirement => {
        // Check if the requirement applies to this building class
        // This could be expanded based on more specific rules
        return true; // For now, return all requirements
      });

    return applicableRequirements;
  } catch (error) {
    console.error(`Error getting special requirements for ${buildingClassification}:`, error);
    throw error;
  }
};

/**
 * Get energy use requirements for a building
 * @param {string} buildingClassification - The building classification
 * @returns {Promise<Object>} The energy use requirements
 */
const getEnergyUseRequirements = async (buildingClassification) => {
  try {
    // Get energy use requirements from the modular structure
    const energyUseData = await getSection('energy-use');
    if (!energyUseData || !energyUseData.energy_use) {
      throw new Error('No energy use data found');
    }

    // Get the energy use requirements for the building classification
    const energyUse = energyUseData.energy_use[buildingClassification];
    
    // If no specific requirements found for this classification, use the default
    if (!energyUse) {
      return energyUseData.energy_use.default;
    }

    return energyUse;
  } catch (error) {
    console.error(`Error getting energy use requirements for ${buildingClassification}:`, error);
    throw error;
  }
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
 * @param {string} classType - The building class type (e.g., 'Class_5')
 * @returns {Promise<Object|null>} - The applicable exemptions or null if not found
 * @throws {Error} - If the building class type is invalid
 */
const getExemptions = async (classType) => {
  try {
    // Validate building class type
    if (!isValidBuildingClass(classType)) {
      throw new Error(`Invalid building class type: ${classType}`);
    }

    // Get exemptions from the modular structure
    const exemptionsData = await getSection('exemptions');
    if (!exemptionsData || !exemptionsData.exemptions) {
      console.warn('No exemptions data found in the decision tree');
      return null;
    }

    const { exemptions } = exemptionsData;
    const applicableExemptions = {};

    // Check each exemption for applicability
    for (const [key, exemption] of Object.entries(exemptions)) {
      // Validate exemption structure
      if (!exemption || typeof exemption !== 'object') {
        console.warn(`Invalid exemption structure for ${key}`);
        continue;
      }

      // If the exemption has excluded classes, check if this class is excluded
      if (Array.isArray(exemption.excluded_classes) && 
          exemption.excluded_classes.includes(classType)) {
        continue;
      }

      applicableExemptions[key] = exemption;
    }

    return Object.keys(applicableExemptions).length > 0 ? applicableExemptions : null;
  } catch (error) {
    console.error(`Error getting exemptions for ${classType}:`, error);
    throw error; // Re-throw the error for proper error handling upstream
  }
};

/**
 * Get verification methods for a building classification
 * @param {string} buildingClassification - The building classification
 * @returns {Promise<Object>} The verification methods
 */
const getVerificationMethods = async (buildingClassification) => {
  try {
    // Get verification methods from the modular structure
    const verificationMethodsData = await getSection('verification-methods');
    if (!verificationMethodsData || !verificationMethodsData.verification_methods) {
      throw new Error('No verification methods data found');
    }

    // Get the verification methods for the building classification
    const verificationMethods = verificationMethodsData.verification_methods[buildingClassification];
    
    // If no specific methods found for this classification, use the default
    if (!verificationMethods) {
      return verificationMethodsData.verification_methods.default;
    }

    return verificationMethods;
  } catch (error) {
    console.error(`Error getting verification methods for ${buildingClassification}:`, error);
    throw error;
  }
};

/**
 * Get energy monitoring requirements based on floor area
 * @param {number} floorArea - The floor area of the building in square meters
 * @returns {Promise<Object>} The energy monitoring requirements
 */
const getEnergyMonitoringRequirements = async (floorArea) => {
  try {
    // Ensure floor area is a number
    floorArea = Number(floorArea);
    console.log(`Processing energy monitoring requirements for floor area: ${floorArea} m²`);
    
    // Get energy monitoring requirements from the modular structure
    const energyMonitoringData = await getSection('energy-monitoring');
    if (!energyMonitoringData || !energyMonitoringData.energy_monitoring) {
      throw new Error('No energy monitoring data found');
    }

    // Determine which area range the floor area falls into
    let areaRange;
    if (floorArea > 2500) {
      areaRange = 'area > 2500';
    } else if (floorArea > 500) {
      areaRange = '500 < area <= 2500';
    } else {
      areaRange = 'area <= 500';
    }
    
    console.log(`Selected area range: ${areaRange}`);

    // Get the energy monitoring requirements for the area range
    const requirements = energyMonitoringData.energy_monitoring[areaRange];
    
    if (!requirements) {
      throw new Error(`No energy monitoring requirements found for area range: ${areaRange}`);
    }

    return requirements;
  } catch (error) {
    console.error(`Error getting energy monitoring requirements for floor area ${floorArea}:`, error);
    throw error;
  }
};

/**
 * Get ceiling fan requirements for J3 section
 * @param {string} buildingClass - The building classification (e.g., 'Class_2')
 * @param {string} climateZone - The climate zone
 * @returns {Promise<Object>} The ceiling fan requirements
 */
const getCeilingFanRequirements = async (buildingClass, climateZone) => {
  try {
    // Get ceiling fan requirements from the modular structure
    const ceilingFanData = await getSection('ceilingfan-elemental-provisions-j3');
    if (!ceilingFanData || !ceilingFanData.ceiling_fan_requirements) {
      throw new Error('No ceiling fan requirements data found');
    }

    // Get the requirements for the building class
    const classRequirements = ceilingFanData.ceiling_fan_requirements[buildingClass];
    
    // If no specific requirements found for this class, use the default
    if (!classRequirements) {
      return ceilingFanData.ceiling_fan_requirements.default;
    }

    // Check if the climate zone is in the required zones
    const isRequired = classRequirements.climate_zones.includes(climateZone);
    
    return {
      requirement: isRequired ? classRequirements.requirement : ceilingFanData.ceiling_fan_requirements.default.requirement,
      isRequired
    };
  } catch (error) {
    console.error(`Error getting ceiling fan requirements for ${buildingClass} in climate zone ${climateZone}:`, error);
    throw error;
  }
};

module.exports = {
  getBuildingClassification,
  getClimateZoneByLocation,
  getCompliancePathway,
  getSpecialRequirements,
  getClimateZoneRequirements,
  getCompliancePathways,
  getExemptions,
  getEnergyUseRequirements,
  getVerificationMethods,
  getEnergyMonitoringRequirements,
  getCeilingFanRequirements,
  isValidBuildingClass // Export for testing
}; 