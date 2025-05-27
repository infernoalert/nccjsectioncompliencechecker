const Conversation = require('../models/Conversation');

function getInitialStepDataFromProject(project) {
  return {
    billingRequired: project.billingRequired ?? false,
    buildingType: project.buildingType,
    buildingClassification: project.buildingClassification?.classType || project.buildingClassification,
    // Add more fields as needed
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