const getBOMConfig = (project) => ({
  role: "You are an expert in electrical metering systems and NCC Section J compliance.",
  context: `
Project details:
- Building Type: ${project.buildingType}
- Building Classification: ${project.buildingClassification?.classType || 'Not specified'}
- Location: ${project.location}
- Floor Area: ${project.floorArea} m²
`,
  instructions: `
Your task is to:
1. Define required components for the EMS system
2. Specify quantities for each component
3. Provide detailed specifications
4. Consider NCC Section J compliance requirements
5. Focus on component selection and justification

Available component types:
- Meters: auth-meter, smart-meter, meter, memory-meter
- Communication: ethernet, rs485, wireless, on-premise
- Cloud: remote connectivity solutions

Format your response as a structured BOM with:
1. Component name
2. Quantity
3. Specifications
4. Justification
5. NCC Section J compliance notes
`
});

module.exports = {
  getBOMConfig
}; 