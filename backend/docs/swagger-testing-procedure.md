# Energy Diagram Generator - Swagger Testing Procedure

This document provides a comprehensive step-by-step procedure for testing the Energy Diagram Generator endpoints using Swagger UI.

## Prerequisites

### 1. Server Setup
```bash
# Start the backend server
cd backend
npm start
# or for development
npm run dev
```

### 2. Access Swagger UI
- **Development**: http://localhost:5000/api-docs
- **Production**: https://api.payamamerian.com/api-docs

### 3. Authentication Required
All Energy Diagram Generator endpoints require authentication. You'll need:
- A valid JWT token
- User account with appropriate permissions

## Step-by-Step Testing Procedure

### Phase 1: Authentication Setup

#### Step 1.1: Register/Login to Get Token
1. Navigate to Swagger UI: `http://localhost:5000/api-docs`
2. Expand the **Auth** section
3. Use **POST /api/auth/register** or **POST /api/auth/login**

**For Registration:**
```json
{
  "email": "test@example.com",
  "password": "testpassword123",
  "role": "user"
}
```

**For Login:**
```json
{
  "email": "test@example.com",
  "password": "testpassword123"
}
```

4. Copy the JWT token from the response
5. Click the **Authorize** button (🔒) at the top of Swagger UI
6. Enter: `Bearer YOUR_JWT_TOKEN`
7. Click **Authorize**

✅ **Expected Result**: Green lock icons appear next to protected endpoints

---

### Phase 2: Sample Data Testing

#### Step 2.1: Get Sample Data
1. Expand **Energy Diagram Generator** section
2. Find **GET /api/energy-diagram/sample-data**
3. Click **Try it out**
4. Click **Execute**

✅ **Expected Result**:
```json
{
  "success": true,
  "sampleData": [
    {
      "_id": "1",
      "label": "Main Smart Meter",
      "panel": "Panel A",
      "monitoringDeviceType": "smart-meter",
      "description": "Primary energy monitoring device",
      "connection": "wireless",
      "status": "active"
    },
    // ... more sample devices
  ],
  "description": "Sample energy monitoring data for testing diagram generation"
}
```

📝 **Note**: Copy the `sampleData` array for use in subsequent tests

---

#### Step 2.2: Generate Sample Diagram
1. Find **POST /api/energy-diagram/generate-sample**
2. Click **Try it out**
3. Use this request body:
```json
{
  "saveToFile": false
}
```
4. Click **Execute**

✅ **Expected Result**:
```json
{
  "success": true,
  "commands": [
    "add,cloud,4,0",
    "add,onpremise,4,8",
    "add,smart-meter,0,16",
    // ... more commands
  ],
  "metadata": {
    "generatedAt": "2024-03-21T10:30:00.000Z",
    "version": "1.0",
    "diagramType": "energy-monitoring",
    "nodeCount": 5,
    "meterTypes": ["smart-meter", "general-meter", "memory-meter"],
    "projectId": "sample",
    "projectName": "Sample Energy Monitoring Project"
  },
  "executionInstructions": {
    "description": "Execute commands in sequence on the frontend diagram engine",
    "totalCommands": 27
  }
}
```

📊 **Verify**:
- `commands` array contains ~25-30 commands
- Commands include: `add`, `set-property`, `connect`, `style`, `layout`, `group`, `fit`
- `metadata.nodeCount` should be 5 (cloud + onpremise + 3 meters)
- `meterTypes` includes all three sample meter types

---

### Phase 3: Data Validation Testing

#### Step 3.1: Validate Sample Data
1. Find **POST /api/energy-diagram/validate**
2. Click **Try it out**
3. Use the sample data from Step 2.1:
```json
{
  "energyMonitoringData": [
    {
      "_id": "1",
      "label": "Main Smart Meter",
      "panel": "Panel A",
      "monitoringDeviceType": "smart-meter",
      "description": "Primary energy monitoring device",
      "connection": "wireless",
      "status": "active"
    },
    {
      "_id": "2",
      "label": "Secondary General Meter",
      "panel": "Panel B",
      "monitoringDeviceType": "general-meter",
      "description": "Secondary monitoring point",
      "connection": "rs485",
      "status": "active"
    },
    {
      "_id": "3",
      "label": "Memory Meter Unit",
      "panel": "Panel C",
      "monitoringDeviceType": "memory-meter",
      "description": "Data logging meter",
      "connection": "rs485",
      "status": "active"
    }
  ]
}
```
4. Click **Execute**

✅ **Expected Result**:
```json
{
  "success": true,
  "valid": true,
  "summary": {
    "totalItems": 3,
    "validItems": 3,
    "invalidItems": 0,
    "errorCount": 0,
    "warningCount": 0
  },
  "validationResults": [
    {
      "index": 0,
      "id": "1",
      "valid": true,
      "errors": [],
      "warnings": []
    }
    // ... more validation results
  ],
  "supportedDeviceTypes": [
    "smart-meter",
    "general-meter",
    "memory-meter",
    "auth-meter",
    "cloud",
    "onpremise",
    "transformer",
    "load"
  ]
}
```

---

#### Step 3.2: Test Invalid Data Validation
1. Use **POST /api/energy-diagram/validate** again
2. Use invalid data:
```json
{
  "energyMonitoringData": [
    {
      "_id": "invalid1",
      "label": "Invalid Meter",
      "panel": "Panel X",
      "monitoringDeviceType": "invalid-type",
      "status": "active"
    },
    {
      "_id": "invalid2",
      "panel": "Panel Y"
      // Missing required fields
    }
  ]
}
```
3. Click **Execute**

✅ **Expected Result**:
```json
{
  "success": true,
  "valid": false,
  "summary": {
    "totalItems": 2,
    "validItems": 0,
    "invalidItems": 2,
    "errorCount": 3,
    "warningCount": 1
  },
  "validationResults": [
    {
      "index": 0,
      "id": "invalid1",
      "valid": false,
      "errors": [
        "Unsupported device type: invalid-type. Supported types: smart-meter, general-meter, memory-meter, auth-meter"
      ],
      "warnings": []
    },
    {
      "index": 1,
      "id": "invalid2",
      "valid": false,
      "errors": [
        "monitoringDeviceType is required"
      ],
      "warnings": [
        "label is recommended for better diagram readability"
      ]
    }
  ]
}
```

---

### Phase 4: Custom Data Generation

#### Step 4.1: Generate from Custom Data
1. Find **POST /api/energy-diagram/generate**
2. Click **Try it out**
3. Use custom data:
```json
{
  "energyMonitoringData": [
    {
      "_id": "custom1",
      "label": "Building Main Meter",
      "panel": "Main Electrical Panel",
      "monitoringDeviceType": "smart-meter",
      "description": "Primary building energy meter with IoT capabilities",
      "status": "active"
    },
    {
      "_id": "custom2",
      "label": "HVAC System Meter",
      "panel": "HVAC Panel",
      "monitoringDeviceType": "general-meter",
      "description": "Dedicated meter for HVAC energy monitoring",
      "status": "active"
    },
    {
      "_id": "custom3",
      "label": "Authority Meter",
      "panel": "Authority Panel",
      "monitoringDeviceType": "auth-meter",
      "description": "Authority-required metering point",
      "status": "active"
    }
  ],
  "projectData": {
    "projectId": "test-building-123",
    "projectName": "Test Building Energy Management"
  },
  "saveToFile": true
}
```
4. Click **Execute**

✅ **Expected Result**:
```json
{
  "success": true,
  "commands": [
    "add,cloud,4,0",
    "add,onpremise,4,8",
    "add,smart-meter,0,16",
    "set-property,smart-meter-1,label,Building Main Meter",
    // ... more commands
  ],
  "metadata": {
    "generatedAt": "2024-03-21T10:35:00.000Z",
    "nodeCount": 5,
    "meterTypes": ["smart-meter", "general-meter", "auth-meter"],
    "projectId": "test-building-123",
    "projectName": "Test Building Energy Management"
  },
  "fileInfo": {
    "filePath": "/path/to/energy-diagram-test-building-123-timestamp.json",
    "filename": "energy-diagram-test-building-123-timestamp.json",
    "diagramData": { /* complete diagram data */ }
  }
}
```

📊 **Verify**:
- Commands include all three custom meters
- Labels match the custom data
- `fileInfo` is present because `saveToFile: true`
- `auth-meter` appears in `meterTypes`

---

### Phase 5: Project-Based Generation

#### Step 5.1: Create Test Project (Optional)
If you need a project with energy monitoring data:

1. Find **POST /api/projects** in the Projects section
2. Create a test project:
```json
{
  "name": "Energy Diagram Test Project",
  "buildingType": "Commercial Office",
  "location": "Sydney, NSW",
  "floorArea": 1000,
  "description": "Test project for energy diagram generation"
}
```
3. Note the project ID from the response

---

#### Step 5.2: Generate from Project Data
1. Find **POST /api/projects/{projectId}/energy-diagram/generate**
2. Click **Try it out**
3. Enter a valid project ID in the path parameter
4. Use request body:
```json
{
  "saveToFile": false
}
```
5. Click **Execute**

✅ **Expected Results**:

**If project has energy monitoring data:**
```json
{
  "success": true,
  "commands": [ /* diagram commands */ ],
  "metadata": {
    "projectId": "actual-project-id",
    "projectName": "Energy Diagram Test Project"
  }
}
```

**If project has no energy monitoring data:**
```json
{
  "success": true,
  "commands": [ /* sample data commands */ ],
  "metadata": {
    "nodeCount": 5,
    "meterTypes": ["smart-meter", "general-meter", "memory-meter"]
  }
}
```

**If project not found:**
```json
{
  "success": false,
  "error": "Project not found"
}
```

---

### Phase 6: Error Handling Tests

#### Step 6.1: Test Missing Authentication
1. Click the **Authorize** button and **Logout**
2. Try any Energy Diagram Generator endpoint
3. Click **Execute**

✅ **Expected Result**: `401 Unauthorized` error

---

#### Step 6.2: Test Invalid Project ID
1. Re-authenticate with your token
2. Use **POST /api/projects/{projectId}/energy-diagram/generate**
3. Enter invalid project ID: `invalid-project-id`
4. Click **Execute**

✅ **Expected Result**:
```json
{
  "success": false,
  "error": "Project not found"
}
```

---

#### Step 6.3: Test Missing Required Data
1. Use **POST /api/energy-diagram/generate**
2. Send empty or invalid request body:
```json
{
  "projectData": {
    "projectId": "test"
  }
}
```
3. Click **Execute**

✅ **Expected Result**:
```json
{
  "success": false,
  "error": "energyMonitoringData must be provided as an array"
}
```

---

## Test Results Verification Checklist

### ✅ Functional Tests
- [ ] Authentication works correctly
- [ ] Sample data retrieval successful
- [ ] Sample diagram generation produces valid commands
- [ ] Data validation correctly identifies valid/invalid data
- [ ] Custom data generation works with various device types
- [ ] Project-based generation handles existing/missing data
- [ ] File saving functionality works when requested

### ✅ Command Structure Verification
- [ ] Commands follow diagram programming language specification
- [ ] Infrastructure nodes (cloud, onpremise) are created first
- [ ] Meter nodes are positioned correctly
- [ ] Connections are established based on device types
- [ ] Styling commands are applied
- [ ] Layout and grouping commands are included
- [ ] Commands end with `fit` command

### ✅ Data Integrity
- [ ] Node positions are logical (cloud at top, meters at bottom)
- [ ] Smart meters connect to both cloud and onpremise
- [ ] Other meters connect only to onpremise
- [ ] Metadata contains accurate information
- [ ] Device types are correctly mapped

### ✅ Error Handling
- [ ] Authentication errors return 401
- [ ] Invalid project IDs return 404
- [ ] Missing required data returns 400
- [ ] Server errors return 500 with details

### ✅ Performance
- [ ] Response times are reasonable (<2 seconds)
- [ ] Large datasets are handled efficiently
- [ ] File operations complete successfully

---

## Common Issues and Troubleshooting

### Issue 1: "Authorization header missing"
**Solution**: Ensure you've clicked **Authorize** and entered `Bearer YOUR_JWT_TOKEN`

### Issue 2: "Project not found"
**Solution**: Use a valid project ID or create a test project first

### Issue 3: "Unknown meter type"
**Solution**: Use only supported device types: `smart-meter`, `general-meter`, `memory-meter`, `auth-meter`

### Issue 4: Empty commands array
**Solution**: Check that energy monitoring data is properly formatted and contains valid devices

### Issue 5: File save errors
**Solution**: Ensure the backend has write permissions to the output directory

---

## Advanced Testing Scenarios

### Scenario 1: Large Dataset
Test with 10+ energy monitoring devices to verify performance and layout.

### Scenario 2: Mixed Device Types
Test with all supported device types in a single request.

### Scenario 3: Edge Cases
- Empty arrays
- Devices with minimal data
- Very long labels/descriptions
- Special characters in labels

### Scenario 4: Concurrent Requests
Test multiple simultaneous requests to verify thread safety.

---

## Expected Command Patterns

### Basic Structure:
1. **Infrastructure**: `add,cloud,4,0` → `add,onpremise,4,8`
2. **Meters**: `add,{meter-type},{x},{y}`
3. **Properties**: `set-property,{node-id},{property},{value}`
4. **Connections**: `connect,{source},{target},{connection-type}`
5. **Styling**: `style,{node-id},{property},{value}`
6. **Layout**: `layout,hierarchical`
7. **Grouping**: `group,{group-name},{node-ids}`
8. **Finalization**: `fit`

### Connection Patterns:
- **Smart Meter**: Connects to both cloud (wireless) and onpremise (ethernet)
- **General Meter**: Connects to onpremise (rs485)
- **Memory Meter**: Connects to onpremise (rs485)
- **Auth Meter**: Connects to onpremise (ethernet)

This comprehensive testing procedure ensures all aspects of the Energy Diagram Generator are thoroughly validated using Swagger UI. 