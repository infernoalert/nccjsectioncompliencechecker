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

<<<<<<< HEAD
function getStep2DataFromProject(project) {
  console.log('\n=== Step 2 Data Creation ===');
  console.log('Project Size:', project.floorArea);

  // Initialize components array
  const components = [
    {
      id: 'smartmeter',
      label: 'Smart Meter',
      exists: false,
      partNumber: '',
      externalLink: ''
    },
    {
      id: 'cloud',
      label: 'Cloud',
      exists: false,
      partNumber: '',
      externalLink: ''
    },
    {
      id: 'wireless',
      label: 'Wireless',
      exists: false,
      partNumber: '',
      externalLink: ''
    },
    {
      id: 'rs485',
      label: 'RS485',
      exists: false,
      partNumber: '',
      externalLink: ''
    },
    {
      id: 'ethernet',
      label: 'Ethernet',
      exists: false,
      partNumber: '',
      externalLink: ''
    },
    {
      id: 'onpremise',
      label: 'On Premise',
      exists: false,
      partNumber: '',
      externalLink: ''
    },
    {
      id: 'metermemory',
      label: 'Meter Memory',
      exists: false,
      partNumber: '',
      externalLink: ''
    },
    {
      id: 'meter',
      label: 'Meter',
      exists: false,
      partNumber: '',
      externalLink: ''
    }
  ];

  // Set exists values based on project size
  if (project.floorArea > 2500) {
    // For projects > 2500
    components.forEach(component => {
      if (component.id === 'meter' || component.id === 'metermemory') {
        component.exists = false;
      } else {
        component.exists = true;
      }
    });
  } else if (project.floorArea >= 500 && project.floorArea <= 2500) {
    // For projects between 500 and 2500
    components.forEach(component => {
      component.exists = component.id === 'metermemory';
    });
  } else {
    // For projects < 500
    components.forEach(component => {
      component.exists = component.id === 'meter';
    });
  }

  // Convert array to object keyed by id
  const bomObject = {};
  components.forEach(component => {
    bomObject[component.id] = {
      exists: component.exists,
      partNumber: component.partNumber,
      externalLink: component.externalLink
    };
  });

  console.log('\nGenerated Step 2 Data:');
  console.log(JSON.stringify(bomObject, null, 2));
  console.log('=== Step 2 Data Creation Complete ===\n');

  return bomObject;
=======
function getBomStepData() {
  console.log('\n=== BOM Step Data Creation ===');
  
  const bomData = {
    materialsList: []  // Array of materials as defined in steps.json
  };

  console.log('\nGenerated BOM Step Data:');
  console.log(JSON.stringify(bomData, null, 2));
  console.log('=== BOM Step Data Creation Complete ===\n');

  return bomData;
>>>>>>> 4308176adfab27cea1113a6e7a3913936a0fbfae
}

async function seedStepDataForProject(project) {
  console.log('\n=== Seeding Step Data for Project ===');
  console.log('Project ID:', project._id);

  const initialStepKey = 'initial';
  const bomStepKey = 'bom';
  
  // Get initial step data
  const initialStepData = getInitialStepDataFromProject(project);
<<<<<<< HEAD
  const step2Data = getStep2DataFromProject(project);
=======
  
  // Get BOM step data
  const bomStepData = getBomStepData();
>>>>>>> 4308176adfab27cea1113a6e7a3913936a0fbfae

  const conversation = new Conversation({
    project: project._id,
    messages: [],
<<<<<<< HEAD
    stepData: { 
      [initialStepKey]: initialStepData,
      'bom': step2Data 
=======
    stepData: {
      [initialStepKey]: initialStepData,
      [bomStepKey]: bomStepData
>>>>>>> 4308176adfab27cea1113a6e7a3913936a0fbfae
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