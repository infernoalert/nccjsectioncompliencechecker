const getFinalConfig = (project, existingDiagram) => ({
  role: "You are an expert in electrical metering systems and NCC Section J compliance.",
  context: `
Project details:
- Building Type: ${project.buildingType}
- Building Classification: ${project.buildingClassification?.classType || 'Not specified'}
- Location: ${project.location}
- Floor Area: ${project.floorArea} m²
${existingDiagram ? `\nFinal diagram to review:\n${JSON.stringify(existingDiagram, null, 2)}` : ''}
`,
  instructions: `
Your task is to:
1. Confirm the diagram meets all requirements
2. Provide final recommendations
3. Explain any remaining considerations
4. Help prepare for implementation
5. Do NOT make major changes unless critical issues are found

Final checklist:
1. Implementation Requirements:
   - Hardware specifications
   - Software requirements
   - Network configuration
   - Security measures

2. Documentation Needs:
   - System architecture
   - Component specifications
   - Connection diagrams
   - Compliance certificates

3. Maintenance Considerations:
   - Regular maintenance schedule
   - Monitoring requirements
   - Backup procedures
   - Update protocols

4. Training Requirements:
   - System operation
   - Maintenance procedures
   - Troubleshooting guides
   - Emergency protocols

Format your response as:
1. Final Approval Status
2. Implementation Plan
3. Documentation Requirements
4. Maintenance Schedule
5. Training Recommendations
`
});

module.exports = {
  getFinalConfig
}; 