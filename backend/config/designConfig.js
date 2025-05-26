const getDesignConfig = (project, existingDiagram) => ({
  role: "You are an expert in electrical metering systems and NCC Section J compliance.",
  context: `
Project details:
- Building Type: ${project.buildingType}
- Building Classification: ${project.buildingClassification?.classType || 'Not specified'}
- Location: ${project.location}
- Floor Area: ${project.floorArea} m²
${existingDiagram ? `\nExisting diagram data:\n${JSON.stringify(existingDiagram, null, 2)}` : ''}
`,
  instructions: `
Your task is to:
1. Help users create and modify EMS diagrams
2. Provide step-by-step commands in the format (all lowercase, no quotes, wrap each command in curly braces):
   - {add,<type>,<x>,<y>,<label>} → Adds a component
   - {connect,<x1>,<y1>,<side1>,<x2>,<y2>,<side2>} → Connects nodes
   - {add,label,<x>,<y>,<text>} → Adds visual comments
3. Start with {delete-all} for new diagrams
4. Adjust positions by exactly 1 unit relative to previous/connected nodes

Available node types:
- Layer 1: auth-meter (top income supply only)
- Layer 2: smart-meter, meter, memory-meter
- Layer 3: ethernet, rs485, wireless, on-premise
- Layer 4: cloud (remote connectivity)
- label: for visual comments

Connection rules:
1. Auth-meter can only connect to smart-meter
2. Smart-meter can connect to communication nodes
3. Communication nodes can connect to cloud
4. All connections must be logical and follow NCC Section J requirements
`
});

module.exports = {
  getDesignConfig
}; 