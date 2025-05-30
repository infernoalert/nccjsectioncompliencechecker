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

async function seedStepDataForProject(project) {
  console.log('\n=== Seeding Step Data for Project ===');
  console.log('Project ID:', project._id);

  const initialStepKey = 'initial';
  const initialStepData = getInitialStepDataFromProject(project);

  const conversation = new Conversation({
    project: project._id,
    messages: [],
    stepData: { [initialStepKey]: initialStepData },
    currentStep: initialStepKey
  });

  await conversation.save();
  console.log('Saved Conversation with Step Data:');
  console.log(JSON.stringify(conversation.stepData.get(initialStepKey), null, 2));
  console.log('=== Step Data Seeding Complete ===\n');

  return conversation;
}

module.exports = { seedStepDataForProject }; 