# ⚡ Energy Diagram API Frontend Integration

This document describes how the frontend automatically generates energy diagrams using the backend API.

## 🔌 How It Works

The frontend now automatically calls the backend API `POST /api/projects/{projectId}/energy-diagram/generate` to create visual energy monitoring diagrams.

### Automatic Generation

When you visit `http://localhost:3000/projects/{projectId}/diagram`, the system will:

1. **Auto-detect** if the diagram is empty
2. **Automatically call** the energy diagram API
3. **Generate and display** the diagram without user interaction
4. **Show loading states** during generation

### Manual Generation

You can also manually trigger diagram generation using the **"⚡ Generate Energy Diagram"** button.

## 🎯 Frontend Features

### Enhanced Command Processing

The frontend now processes all backend commands:

- ✅ **Node Creation** (`add` commands)
- ✅ **Property Setting** (`set-property` commands) 
- ✅ **Connections** (`connect` commands)
- ✅ **Styling** (`style` commands)
- ✅ **Connection Types** (wireless, ethernet, rs485)

### Visual Enhancements

- **Color-coded connections** (wireless=blue, ethernet=green, rs485=orange)
- **Animated wireless connections** (dashed lines)
- **Improved node spacing** for energy diagrams
- **Auto-fit view** after generation
- **Loading states** with progress messages

### Node Type Mapping

Backend → Frontend node types:
- `cloud` → `cloud`
- `onpremise` → `onPremise` 
- `smart-meter` → `smartMeter`
- `general-meter` → `meter`
- `memory-meter` → `meterMemory`
- `auth-meter` → `authorityMeter`

## 🚀 Usage Instructions

### 1. Basic Usage

Simply navigate to the diagram page:
```
http://localhost:3000/projects/684a53d0312f7c81654304c4/diagram
```

The diagram will automatically generate if:
- Project exists
- Project has energy monitoring devices
- User is authenticated

### 2. Testing the API

Visit the test page to verify API functionality:
```
http://localhost:3000/projects/684a53d0312f7c81654304c4/energy-diagram-test
```

This page allows you to:
- Test the API with different project IDs
- View raw API responses
- Debug any issues

### 3. Requirements

For successful diagram generation, ensure:

1. **Project exists** with the specified ID
2. **Authentication** - User must be logged in
3. **Energy monitoring devices** - Project must have configured devices
4. **Backend API** - Must be running on `http://localhost:5000`

## 📋 Project Requirements

### Energy Monitoring Device Structure

Each device must have:
```json
{
  "label": "string (required)",
  "panel": "string (required)", 
  "monitoringDeviceType": "smart-meter|general-meter|memory-meter|auth-meter",
  "description": "string (optional)",
  "connection": "string (optional)",
  "status": "active|inactive|maintenance"
}
```

### Supported Device Types

- **smart-meter** - Connects to both cloud and on-premise
- **general-meter** - Connects only to on-premise via RS485
- **memory-meter** - Data logging meter, RS485 connection
- **auth-meter** - Authority meter, ethernet connection

## 🔧 Configuration

### API Endpoints

The frontend automatically detects the environment:
- **Development**: `http://localhost:5000`
- **Production**: `https://api.payamamerian.com`

### Auto-Generation Settings

```javascript
// Auto-generation triggers after 1 second delay
const GENERATION_DELAY = 1000;

// Only auto-generates if diagram is empty 
if (nodes.length === 0) {
  // Trigger auto-generation
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"No energy monitoring devices found"**
   - Add energy monitoring devices to the project
   - Ensure devices have required fields (label, panel, monitoringDeviceType)

2. **"Authentication required"**
   - Log in to the application
   - Check if JWT token is valid

3. **"Project not found"**
   - Verify the project ID exists
   - Check if user has access to the project

4. **API Connection Issues**
   - Ensure backend is running on port 5000
   - Check network connectivity
   - Verify CORS configuration

### Debug Tools

1. **Browser Console** - Check for errors and logs
2. **Network Tab** - Monitor API requests
3. **Test Component** - Use `/energy-diagram-test` route

## 📊 Example Response

Successful API response structure:
```json
{
  "success": true,
  "commands": [
    "add,cloud,4,0",
    "add,onpremise,4,8", 
    "add,smart-meter,0,16",
    "set-property,smart-meter-1,label,Main Smart Meter",
    "connect,smart-meter-1,cloud-1,wireless"
  ],
  "metadata": {
    "nodeCount": 5,
    "deviceCount": 3,
    "meterTypes": ["smart-meter", "general-meter"],
    "projectId": "684a53d0312f7c81654304c4",
    "projectName": "Sample Project"
  }
}
```

## 🎨 Customization

### Styling

Modify the node positioning and spacing:
```javascript
const position = {
  x: 50 + x * 200, // Horizontal spacing
  y: 50 + y * 120  // Vertical spacing
};
```

### Connection Colors

Customize connection colors in the command processing:
```javascript
const edgeStyle = {
  stroke: connectionType === 'wireless' ? '#2196F3' : 
          connectionType === 'ethernet' ? '#4CAF50' : 
          connectionType === 'rs485' ? '#FF9800' : '#000'
};
```

## 📝 Development Notes

- Auto-generation only runs once per page load
- Manual generation always works regardless of existing diagram
- Loading states prevent multiple simultaneous generations
- All commands are processed in sequence for proper diagram building 