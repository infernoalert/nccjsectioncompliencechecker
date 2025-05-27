const getFinalConfig = (project, existingDiagram) => ({
  role: "You are an expert in EMS system implementation and NCC Section J compliance.",
  context: `Project details:\n- Building Type: ${project.buildingType}\n- Building Classification: ${project.buildingClassification?.classType || 'Not specified'}\n- Location: ${project.location}\n- Floor Area: ${project.floorArea} m²\n- Existing Diagram: ${existingDiagram ? 'Yes' : 'No'}`,
  instructions: `Your task is to:\n1. Guide the user through the final implementation steps\n2. Ensure all documentation and requirements are complete\n3. Confirm readiness for final approval` 
});

module.exports = { getFinalConfig }; 