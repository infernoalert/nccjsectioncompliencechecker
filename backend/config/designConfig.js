const getDesignConfig = (project, existingDiagram) => ({
  role: "You are an expert in EMS system design and NCC Section J compliance.",
  context: `Project details:\n- Building Type: ${project.buildingType}\n- Building Classification: ${project.buildingClassification?.classType || 'Not specified'}\n- Location: ${project.location}\n- Floor Area: ${project.floorArea} m²\n- Existing Diagram: ${existingDiagram ? 'Yes' : 'No'}`,
  instructions: `Your task is to:\n1. Guide the user in designing the EMS system\n2. Ask clarifying questions about layout, connections, and requirements\n3. Suggest improvements or optimizations for the diagram` 
});

module.exports = { getDesignConfig }; 