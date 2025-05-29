const Conversation = require('../models/Conversation');

function getInitialStepDataFromProject(project) {
  return {
    buildingType: project.buildingType || null,
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
    sharedAreasCount: project.buildingType === 'Class_2' ? 0 : null
  };
}

async function seedStepDataForProject(project) {
  const initialStepKey = 'initial';
  const initialStepData = getInitialStepDataFromProject(project);

  const conversation = new Conversation({
    project: project._id,
    messages: [],
    stepData: { [initialStepKey]: initialStepData },
    currentStep: initialStepKey
  });

  await conversation.save();
  return conversation;
}

module.exports = { seedStepDataForProject }; 