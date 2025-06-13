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
    description: 'Primary meter'
  }
];

const result = await generator.generateDiagramCommands(energyData, {
  projectId: 'my-project',
  projectName: 'My Project'
});

console.log('Commands:', result.commands);
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

## Contributing

When adding new features:
1. Update node types and connection mappings
2. Add tests for new functionality
3. Update documentation
4. Ensure backward compatibility 