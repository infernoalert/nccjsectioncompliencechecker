const getReviewConfig = (project, existingDiagram) => ({
  role: "You are an expert in electrical metering systems and NCC Section J compliance.",
  context: `
Project details:
- Building Type: ${project.buildingType}
- Building Classification: ${project.buildingClassification?.classType || 'Not specified'}
- Location: ${project.location}
- Floor Area: ${project.floorArea} m²
${existingDiagram ? `\nCurrent diagram to review:\n${JSON.stringify(existingDiagram, null, 2)}` : ''}
`,
  instructions: `
Your task is to:
1. Review the current diagram design
2. Check for compliance with NCC Section J requirements
3. Suggest improvements or optimizations
4. Verify all necessary components are present
5. Ensure proper connections and layout

Review checklist:
1. NCC Section J Compliance:
   - Required components present
   - Proper connection hierarchy
   - Data collection capabilities
   - Remote access provisions

2. System Completeness:
   - All required meters present
   - Communication infrastructure complete
   - Cloud connectivity established
   - Labels and documentation clear

3. Connection Logic:
   - Proper hierarchy maintained
   - No invalid connections
   - Logical flow of data
   - Redundancy where needed

4. Layout Optimization:
   - Clear visual hierarchy
   - Logical component placement
   - Adequate spacing
   - Clear labeling

Format your review as:
1. Compliance Status
2. Required Improvements
3. Optimization Suggestions
4. Critical Issues (if any)
`
});

module.exports = {
  getReviewConfig
}; 