# Energy Diagram Generator

The Energy Diagram Generator is a system that creates diagram commands based on energy monitoring data from your project database. It generates JSON command files that can be executed on the frontend to create visual diagrams.

## Overview

The system consists of:
1. **EnergyDiagramGenerator Service** - Core logic for generating diagram commands
2. **EnergyDiagramController** - API endpoints for diagram generation
3. **Routes** - RESTful API routes for accessing the functionality
4. **Command Output** - JSON files with executable diagram commands

## Features

- ✅ **Node Type Support**: smart-meter, general-meter, memory-meter, auth-meter
- ✅ **Infrastructure Nodes**: Automatic cloud and on-premise infrastructure
- ✅ **Hierarchical Layout**: Cloud at top, on-premise below, meters at bottom
- ✅ **Smart Connections**: Automatic connections based on device types
- ✅ **Styling**: Color-coded nodes and grouped elements
- ✅ **Validation**: Data validation and error handling
- ✅ **File Export**: Save commands to JSON files
- ✅ **Sample Data**: Built-in sample data for testing
- 🚀 **Rule-Based Design Engine**: Flexible rule system for custom diagram logic
- 🚀 **Custom Rules**: Add/modify rules without changing core code
- 🚀 **Priority System**: Rules can override each other based on priority
- 🚀 **Quick Configurations**: Pre-built rule sets for common scenarios
- 🚀 **Rule Templates**: Reusable rule patterns for common use cases

## API Endpoints

### 1. Generate from Project Data
```http
POST /api/projects/:projectId/energy-diagram/generate
```

**Request Body:**
```json
{
  "saveToFile": false
}
```

**Response:**
```json
{
  "success": true,
  "commands": ["add,cloud,4,0", "add,onpremise,4,8", ...],
  "metadata": {
    "generatedAt": "2024-03-21T10:30:00.000Z",
    "version": "1.0",
    "diagramType": "energy-monitoring",
    "nodeCount": 5,
    "meterTypes": ["smart-meter", "general-meter"],
    "projectId": "project-id",
    "projectName": "Project Name"
  },
  "executionInstructions": {
    "description": "Execute commands in sequence on the frontend diagram engine",
    "totalCommands": 33
  }
}
```

### 2. Generate from Custom Data
```http
POST /api/energy-diagram/generate
```

**Request Body:**
```json
{
  "energyMonitoringData": [
    {
      "_id": "1",
      "label": "Main Smart Meter",
      "panel": "Panel A",
      "monitoringDeviceType": "smart-meter",
      "description": "Primary energy monitoring device",
      "status": "active"
    }
  ],
  "projectData": {
    "projectId": "custom-project",
    "projectName": "Custom Project"
  },
  "saveToFile": false
}
```

### 3. Get Sample Data
```http
GET /api/energy-diagram/sample-data
```

### 4. Generate Sample Diagram
```http
POST /api/energy-diagram/generate-sample
```

### 5. Validate Data
```http
POST /api/energy-diagram/validate
```

## Supported Node Types

| Node Type | Description | Required Connections | Connection Type |
|-----------|-------------|---------------------|-----------------|
| `smart-meter` | Smart energy meter | cloud, onpremise | wireless, ethernet |
| `general-meter` | General purpose meter | onpremise | rs485 |
| `memory-meter` | Data logging meter | onpremise | rs485 |
| `auth-meter` | Authority meter | onpremise | ethernet |
| `cloud` | Cloud infrastructure | - | - |
| `onpremise` | On-premise server | - | - |

## Diagram Rules

1. **Cloud Node**: Always placed at the highest level (y=0)
2. **On-premise Node**: Placed below cloud (y=8)
3. **Meter Nodes**: Placed horizontally at the bottom level (y=16)
4. **Smart Meters**: Must connect to both cloud and on-premise
5. **Other Meters**: Connect only to on-premise infrastructure
6. **Automatic Grouping**: Meters grouped by type, infrastructure grouped separately

## Command Format

The generated commands follow the diagram programming language specification:

```
add,<node-type>,<x>,<y>                    # Add node
set-property,<node-id>,<property>,<value>  # Set node property
connect,<source>,<target>,<connection-type> # Connect nodes
style,<node-id>,<property>,<value>         # Style node
group,<group-name>,<node-ids>              # Group nodes
layout,<layout-type>                       # Apply layout
```

## Usage Examples

### Basic Usage
```javascript
// Using the service directly
const EnergyDiagramGenerator = require('./services/energyDiagramGenerator');
const generator = new EnergyDiagramGenerator();

const energyData = [
  {
    _id: '1',
    label: 'Main Meter',
    panel: 'Panel A',
    monitoringDeviceType: 'smart-meter',
    description: 'Primary meter',
    capacity: 3000,
    critical: true
  }
];

const result = await generator.generateDiagramCommands(energyData, {
  projectId: 'my-project',
  projectName: 'My Project'
});

console.log('Commands:', result.commands);
```

### Rule-Based Usage

#### Using Custom Rules
```javascript
const { customDiagramRules } = require('./config/diagramRules');

// Initialize with custom rules
const generator = new EnergyDiagramGenerator(customDiagramRules);

// The generator will automatically:
// - Place wireless devices on top
// - Use ethernet for devices > 2500 capacity
// - Apply visual coding based on capacity
// - Highlight critical devices

const result = await generator.generateDiagramCommands(energyData, projectData);
```

#### Adding Rules Dynamically
```javascript
const generator = new EnergyDiagramGenerator();

// Add a custom positioning rule
generator.addRule('positionRules', {
  name: 'high-priority-center',
  description: 'Place high-priority devices in center',
  condition: (node, context) => node.priority === 'high',
  action: (node, context) => ({
    position: { 
      x: context.gridConfig.startX + (context.totalDevices * context.gridConfig.cellWidth / 2),
      y: node.position.y 
    }
  }),
  priority: 90
});

// Add a connection rule
generator.addRule('connectionRules', {
  name: 'ethernet-for-large-capacity',
  description: 'Use ethernet for devices > 2500 capacity',
  condition: (node, context) => node.capacity > 2500,
  action: (node, context) => ({ connectionType: 'ethernet' }),
  priority: 85
});
```

#### Using Quick Configurations
```javascript
const { quickConfigurations } = require('./config/diagramRules');

// Industrial environment setup
const industrialGenerator = new EnergyDiagramGenerator(quickConfigurations.industrial);

// Commercial building setup  
const commercialGenerator = new EnergyDiagramGenerator(quickConfigurations.commercial);

// Critical device focus
const criticalGenerator = new EnergyDiagramGenerator(quickConfigurations.criticalFocus);
```

#### Using Rule Templates
```javascript
const { ruleTemplates } = require('./config/diagramRules');

const generator = new EnergyDiagramGenerator();

// Create rules from templates
const capacityRule = ruleTemplates.createCapacityRule(2500, 'ethernet', 80);
const locationRule = ruleTemplates.createLocationRule('building-a', { color: '#E3F2FD' }, 70);

generator.addRule('connectionRules', capacityRule);
generator.addRule('stylingRules', locationRule);
```

### API Usage
```javascript
// Frontend API call
const response = await fetch('/api/projects/123/energy-diagram/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    saveToFile: true
  })
});

const data = await response.json();
// Execute commands on frontend diagram engine
data.commands.forEach(command => {
  diagramEngine.execute(command);
});
```

## Frontend Integration

The generated JSON commands are designed to be executed on the frontend diagram engine:

```javascript
// Example frontend execution
function executeDiagramCommands(commands) {
  commands.forEach((command, index) => {
    setTimeout(() => {
      diagramEngine.executeCommand(command);
    }, index * 100); // Stagger execution for visual effect
  });
}

// Load and execute from API
async function loadDiagram(projectId) {
  const response = await fetch(`/api/projects/${projectId}/energy-diagram/generate`);
  const data = await response.json();
  
  if (data.success) {
    executeDiagramCommands(data.commands);
  }
}
```

## Testing

Run the test suite:
```bash
npm test -- energyDiagramGenerator.test.js
```

Run manual test:
```bash
node backend/tests/energyDiagramGenerator.test.js
```

## File Output

When `saveToFile: true` is specified, the system saves JSON files to:
```
backend/output/diagrams/energy-diagram-{projectId}-{timestamp}.json
```

## Error Handling

The system includes comprehensive error handling:
- Invalid node types
- Missing required data
- File system errors
- Database connection issues

## Customization

### Adding New Node Types
```javascript
// In EnergyDiagramGenerator constructor
this.nodeTypes['new-meter'] = {
  type: 'new-meter',
  requiredConnections: ['onpremise'],
  level: 2,
  color: '#FF5722'
};

this.connectionTypes['new-meter'] = {
  'onpremise': 'ethernet'
};
```

### Custom Layout
```javascript
// Override layout configuration
this.gridConfig = {
  cellWidth: 8,
  cellHeight: 6,
  startX: 0,
  startY: 0,
  levelSpacing: 10
};
```

## Troubleshooting

### Common Issues

1. **"Unknown meter type" error**
   - Check that `monitoringDeviceType` matches supported types
   - Use validation endpoint to check data

2. **Empty diagram generated**
   - Verify energy monitoring data exists in project
   - Check database connection

3. **File save errors**
   - Ensure output directory exists and is writable
   - Check disk space

### Debug Mode
```javascript
// Enable debug logging
const generator = new EnergyDiagramGenerator();
generator.debug = true;
```

## Rule-Based Design System

The Energy Diagram Generator now includes a powerful rule-based design system that allows you to customize diagram generation without modifying core code.

### Rule Categories

#### Position Rules
Control where nodes are placed in the diagram:
```javascript
{
  name: 'wireless-on-top',
  condition: (node, context) => node.connectionType === 'wireless',
  action: (node, context) => ({ position: { ...node.position, y: 0 } }),
  priority: 100
}
```

#### Connection Rules
Determine how nodes connect to each other:
```javascript
{
  name: 'ethernet-for-high-capacity',
  condition: (node, context) => node.capacity > 2500,
  action: (node, context) => ({ connectionType: 'ethernet' }),
  priority: 85
}
```

#### Styling Rules
Control visual appearance:
```javascript
{
  name: 'capacity-based-coloring',
  condition: (node, context) => node.capacity,
  action: (node, context) => ({
    color: node.capacity > 5000 ? '#D32F2F' : '#4CAF50',
    size: node.capacity > 5000 ? 'large' : 'medium'
  }),
  priority: 80
}
```

#### Layout Rules
Organize overall diagram structure:
```javascript
{
  name: 'panel-grouping',
  condition: (nodes, context) => nodes.some(n => n.panel),
  action: (nodes, context) => this.groupByProperty(nodes, 'panel'),
  priority: 70
}
```

### Rule Properties

Each rule must have:
- **name**: Unique identifier
- **description**: Human-readable description
- **condition**: Function that returns true if rule should apply
- **action**: Function that returns modifications to apply
- **priority**: Number (0-100, higher executes first)

### Built-in Rules

The system includes default rules for:
- ✅ Wireless devices always on top
- ✅ Ethernet for high-capacity devices (>2500)
- ✅ Visual coding by capacity and status
- ✅ Critical device highlighting
- ✅ Panel-based grouping
- ✅ Smart meter dual connections
- ✅ Location-aware routing

### Quick Configurations

Pre-built rule sets for common scenarios:

#### Industrial Configuration
```javascript
const { quickConfigurations } = require('./config/diagramRules');
const generator = new EnergyDiagramGenerator(quickConfigurations.industrial);
```
- Emphasizes high-capacity ethernet connections
- Wireless backup for critical devices
- Special positioning for industrial equipment

#### Commercial Configuration  
```javascript
const generator = new EnergyDiagramGenerator(quickConfigurations.commercial);
```
- Capacity-based visual coding
- Status animations
- Wireless device clustering

#### Critical Focus Configuration
```javascript
const generator = new EnergyDiagramGenerator(quickConfigurations.criticalFocus);
```
- Critical devices in center
- Redundant connections
- Special highlighting

### Rule Templates

Reusable patterns for common rules:

```javascript
const { ruleTemplates } = require('./config/diagramRules');

// Create capacity-based rules
const rule1 = ruleTemplates.createCapacityRule(3000, 'ethernet', 80);

// Create location-based rules  
const rule2 = ruleTemplates.createLocationRule('building-a', { color: '#E3F2FD' });

// Create device-type rules
const rule3 = ruleTemplates.createDeviceTypeRule('smart-meter', { priority: 'high' });
```

### Testing Rules

Run the rule system tests:
```bash
node backend/tests/ruleBasedDiagramGenerator.test.js
```

This demonstrates:
- Basic rule application
- Custom rule configuration  
- Dynamic rule addition
- Quick configurations
- Rule conflict resolution
- Performance with many rules

### Performance

The rule system is optimized for performance:
- Rules are sorted by priority once
- Context is shared across rule evaluations
- Failed rules don't break the generation process
- Performance tested with 50+ concurrent rules

## Contributing

When adding new features:
1. Update node types and connection mappings
2. Add tests for new functionality
3. Update documentation
4. Ensure backward compatibility
5. Consider adding rules instead of hardcoded logic
6. Test rule performance and conflicts 