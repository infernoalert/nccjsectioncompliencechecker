const fs = require('fs');
const path = require('path');

// Function to load mapping data from JSON files
const loadMappingData = (mappingFileName) => {
  try {
    const mappingPath = path.join(__dirname, '../data/mappings', mappingFileName);
    const mappingData = fs.readFileSync(mappingPath, 'utf8');
    return JSON.parse(mappingData);
  } catch (error) {
    console.error(`Error loading mapping data from ${mappingFileName}:`, error);
    throw error;
  }
};

// Function to get building classification from building type
const getBuildingClassification = (buildingTypeId) => {
  try {
    const mappingData = loadMappingData('buildingTypeToClassification.json');
    const buildingType = mappingData.buildingTypes.find(type => type.id === buildingTypeId);
    
    if (!buildingType) {
      throw new Error(`Building type ${buildingTypeId} not found in mapping`);
    }
    
    return {
      classification: buildingType.nccClassification,
      name: buildingType.name,
      description: buildingType.description,
      typicalUse: buildingType.typicalUse,
      commonFeatures: buildingType.commonFeatures
    };
  } catch (error) {
    console.error('Error getting building classification:', error);
    throw error;
  }
};

// Function to get all building types
const getAllBuildingTypes = () => {
  try {
    const mappingData = loadMappingData('buildingTypeToClassification.json');
    return mappingData.buildingTypes.map(type => ({
      id: type.id,
      name: type.name,
      description: type.description,
      nccClassification: type.nccClassification
    }));
  } catch (error) {
    console.error('Error getting building types:', error);
    throw error;
  }
};

module.exports = {
  loadMappingData,
  getBuildingClassification,
  getAllBuildingTypes
}; 