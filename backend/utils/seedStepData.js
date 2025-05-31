const Conversation = require('../models/Conversation');
const buildingTypeToClassification = require('../data/mappings/buildingTypeToClassification.json');

function getInitialStepDataFromProject(project) {
  console.log('\n=== Initial Step Data Creation ===');
  console.log('Project Data:', {
    buildingType: project.buildingType,
    floorArea: project.floorArea
  });

  // Find the building type mapping
  const buildingTypeMapping = buildingTypeToClassification.buildingTypes.find(
    type => type.id === project.buildingType
  );
  console.log('Building Type Mapping:', buildingTypeMapping);

  // Get the NCC classification from the mapping
  const buildingClassification = buildingTypeMapping?.nccClassification || null;
  console.log('Building Classification:', buildingClassification);

  const initialData = {
    buildingType: project.buildingType || null,
    buildingClassification: buildingClassification,
    size: project.floorArea || null,
    buildingServices: {
      airConditioning: false,
      artificialLighting: false,
      appliancePower: false,
      centralHotWaterSupply: false,
      internalTransportDevices: false,
      renewableEnergy: false,
      evChargingEquipment: false,
      batterySystems: false
    },
    ancillaryPlants: [],
    sharedAreasCount: buildingClassification === 'Class_2' ? 0 : null
  };

  console.log('\nGenerated Initial Step Data:');
  console.log(JSON.stringify(initialData, null, 2));
  console.log('=== Initial Step Data Creation Complete ===\n');

  return initialData;
}

function getBomStepData() {
  console.log('\n=== BOM Step Data Creation ===');
  
  const bomData = {
    materialsList: []  // Array of materials as defined in steps.json
  };

  console.log('\nGenerated BOM Step Data:');
  console.log(JSON.stringify(bomData, null, 2));
  console.log('=== BOM Step Data Creation Complete ===\n');

  return bomData;
}

async function seedStepDataForProject(project) {
  console.log('\n=== Seeding Step Data for Project ===');
  console.log('Project ID:', project._id);

  const initialStepKey = 'initial';
  const bomStepKey = 'bom';
  
  // Get initial step data
  const initialStepData = getInitialStepDataFromProject(project);
  
  // Get BOM step data
  const bomStepData = getBomStepData();

  const conversation = new Conversation({
    project: project._id,
    messages: [],
    stepData: {
      [initialStepKey]: initialStepData,
      [bomStepKey]: bomStepData
    },
    currentStep: initialStepKey
  });

  await conversation.save();
  console.log('Saved Conversation with Step Data:');
  console.log('Initial Step:', JSON.stringify(conversation.stepData.get(initialStepKey), null, 2));
  console.log('BOM Step:', JSON.stringify(conversation.stepData.get(bomStepKey), null, 2));
  console.log('=== Step Data Seeding Complete ===\n');

  return conversation;
}

module.exports = { seedStepDataForProject }; 