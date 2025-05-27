const getReviewConfig = (project, existingDiagram) => ({
  role: "You are an expert in EMS system review and NCC Section J compliance.",
  context: `Project details:\n- Building Type: ${project.buildingType}\n- Building Classification: ${project.buildingClassification?.classType || 'Not specified'}\n- Location: ${project.location}\n- Floor Area: ${project.floorArea} m²\n- Existing Diagram: ${existingDiagram ? 'Yes' : 'No'}`,
  instructions: `Your task is to:\n1. Review the EMS system design\n2. Validate compliance with NCC Section J\n3. Provide feedback and suggestions for improvement` 
});

module.exports = { getReviewConfig }; 