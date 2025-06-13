# Test Diagram - Energy Monitoring System

## Overview
This document outlines the testing procedures and expected results for the Energy Diagram Generator system in the NCCJ Section Compliance Checker project.

## System Architecture
The Energy Diagram Generator creates visual representations of energy monitoring systems with the following components:

### Node Types
- **Cloud Infrastructure** (Level 0) - Highest level
- **On-Premise Server** (Level 1) - Middle level  
- **Energy Meters** (Level 2) - Bottom level
  - Smart Meter
  - General Meter
  - Memory Meter
  - Authority Meter

### Connection Types
- **Wireless** - Smart meters to cloud
- **Ethernet** - Smart meters to on-premise, auth meters to on-premise
- **RS485** - General and memory meters to on-premise

## Test Scenarios

### 1. Basic Functionality Test
**Objective**: Verify core diagram generation works

**Test Data**:
```json
{
  "energyMonitoringData": [
    {
      "_id": "test1",
      "label": "Main Smart Meter",
      "panel": "Panel A",
      "monitoringDeviceType": "smart-meter",
      "description": "Primary energy monitoring device",
      "status": "active"
    }
  ]
}
```

**Expected Output**:
- Cloud node at position (4, 0)
- On-premise node at position (4, 8)
- Smart meter at position (0, 16)
- Wireless connection: smart-meter → cloud
- Ethernet connection: smart-meter → onpremise
- Hierarchical layout applied

### 2. Multiple Device Types Test
**Objective**: Test all supported device types

**Test Data**:
```json
{
  "energyMonitoringData": [
    {
      "_id": "smart1",
      "label": "Smart Meter 1",
      "panel": "Panel A",
      "monitoringDeviceType": "smart-meter"
    },
    {
      "_id": "general1", 
      "label": "General Meter 1",
      "panel": "Panel B",
      "monitoringDeviceType": "general-meter"
    },
    {
      "_id": "memory1",
      "label": "Memory Meter 1", 
      "panel": "Panel C",
      "monitoringDeviceType": "memory-meter"
    },
    {
      "_id": "auth1",
      "label": "Authority Meter 1",
      "panel": "Panel D", 
      "monitoringDeviceType": "auth-meter"
    }
  ]
}
```

**Expected Output**:
- 6 total nodes (cloud + onpremise + 4 meters)
- Smart meter connects to both cloud and onpremise
- Other meters connect only to onpremise
- Proper spacing between meters (6 units apart)
- Color coding applied to each meter type

### 3. Validation Test
**Objective**: Test data validation functionality

**Invalid Test Data**:
```json
{
  "energyMonitoringData": [
    {
      "_id": "invalid1",
      "label": "Invalid Device",
      "monitoringDeviceType": "invalid-type"
    },
    {
      "_id": "invalid2",
      "panel": "Panel X"
      // Missing required monitoringDeviceType
    }
  ]
}
```

**Expected Validation Results**:
- `valid: false`
- Error for unsupported device type
- Error for missing required field
- Warning for missing label

### 4. Large Dataset Test
**Objective**: Test performance with multiple devices

**Test Data**: 10+ devices of mixed types

**Expected Behavior**:
- Response time < 2 seconds
- Proper horizontal spacing
- All connections established
- Grouping by device type
- No overlapping nodes

## Command Structure Verification

### Expected Command Sequence:
1. **Infrastructure Setup**:
   ```
   add,cloud,4,0
   add,onpremise,4,8
   ```

2. **Device Addition**:
   ```
   add,smart-meter,0,16
   add,general-meter,6,16
   add,memory-meter,12,16
   ```

3. **Property Setting**:
   ```
   set-property,smart-meter-1,label,Main Smart Meter
   set-property,smart-meter-1,panel,Panel A
   ```

4. **Connections**:
   ```
   connect,smart-meter-1,cloud-1,wireless
   connect,smart-meter-1,onpremise-1,ethernet
   connect,general-meter-2,onpremise-1,rs485
   ```

5. **Styling**:
   ```
   style,cloud-1,color,#607D8B
   style,smart-meter-1,color,#4CAF50
   ```

6. **Layout & Grouping**:
   ```
   layout,hierarchical
   group,infrastructure,cloud-1,onpremise-1
   fit
   ```

## API Endpoints Testing

### 1. GET /api/energy-diagram/sample-data
**Purpose**: Retrieve sample data for testing
**Expected**: Array of 3 sample devices

### 2. POST /api/energy-diagram/generate-sample
**Purpose**: Generate diagram with built-in sample data
**Expected**: ~27 commands, 5 nodes, 3 meter types

### 3. POST /api/energy-diagram/validate
**Purpose**: Validate input data structure
**Expected**: Validation summary with errors/warnings

### 4. POST /api/energy-diagram/generate
**Purpose**: Generate from custom data
**Expected**: Commands based on provided data

### 5. POST /api/projects/{id}/energy-diagram/generate
**Purpose**: Generate from project data
**Expected**: Commands based on project's energy monitoring data

## Error Handling Tests

### Authentication Errors
- **Test**: Request without JWT token
- **Expected**: 401 Unauthorized

### Invalid Project ID
- **Test**: Non-existent project ID
- **Expected**: 404 Project not found

### Invalid Data Format
- **Test**: Missing required fields
- **Expected**: 400 Bad Request with validation errors

### Server Errors
- **Test**: Database connection issues
- **Expected**: 500 Internal Server Error with details

## Performance Benchmarks

### Response Time Targets:
- Sample data retrieval: < 100ms
- Simple diagram (1-3 devices): < 500ms
- Complex diagram (10+ devices): < 2000ms
- Validation: < 200ms

### Memory Usage:
- Should not exceed 50MB for typical requests
- No memory leaks during repeated requests

## File Output Testing

### JSON File Structure:
```json
{
  "commands": ["array of commands"],
  "metadata": {
    "generatedAt": "timestamp",
    "version": "1.0",
    "diagramType": "energy-monitoring",
    "nodeCount": 5,
    "meterTypes": ["smart-meter", "general-meter"],
    "projectId": "project-id",
    "projectName": "Project Name"
  },
  "executionInstructions": {
    "description": "Execute commands in sequence",
    "commandFormat": "Diagram programming language",
    "executionOrder": "Commands must be executed in order"
  }
}
```

### File Naming Convention:
`energy-diagram-{projectId}-{timestamp}.json`

## Integration Testing

### Frontend Integration:
1. **Command Execution**: Frontend should execute commands sequentially
2. **Visual Verification**: Diagram should match expected layout
3. **Interactive Features**: Nodes should be clickable/draggable
4. **Error Display**: Invalid commands should show appropriate errors

### Database Integration:
1. **Project Data**: Should read from project's energy monitoring data
2. **User Authentication**: Should respect user permissions
3. **Data Persistence**: File saving should work correctly

## Regression Testing Checklist

- [ ] All device types render correctly
- [ ] Connections follow business rules
- [ ] Styling is applied consistently
- [ ] Layout algorithm works properly
- [ ] Validation catches all error cases
- [ ] File operations complete successfully
- [ ] Authentication is enforced
- [ ] Error messages are helpful
- [ ] Performance meets benchmarks
- [ ] Memory usage is reasonable

## Test Environment Setup

### Prerequisites:
1. Node.js server running
2. MongoDB connection active
3. Valid JWT token for authentication
4. Swagger UI accessible at /api-docs

### Test Data Preparation:
1. Create test project with energy monitoring data
2. Prepare various device type combinations
3. Set up invalid data scenarios
4. Configure file system permissions

## Automated Testing

### Unit Tests:
- EnergyDiagramGenerator class methods
- Command generation logic
- Validation functions
- Error handling

### Integration Tests:
- API endpoint responses
- Database operations
- File system operations
- Authentication middleware

### End-to-End Tests:
- Complete workflow from data to diagram
- Frontend command execution
- User authentication flow
- Error recovery scenarios

## Success Criteria

### Functional Requirements:
✅ Generate valid diagram commands
✅ Support all device types
✅ Enforce connection rules
✅ Apply proper styling
✅ Handle validation errors
✅ Save files when requested

### Non-Functional Requirements:
✅ Response time < 2 seconds
✅ Handle 100+ concurrent requests
✅ Memory usage < 100MB
✅ 99.9% uptime
✅ Secure authentication
✅ Comprehensive error logging

## Troubleshooting Guide

### Common Issues:
1. **Empty commands array**: Check input data format
2. **Authentication failures**: Verify JWT token
3. **Invalid device types**: Use supported types only
4. **File save errors**: Check directory permissions
5. **Performance issues**: Optimize data size

### Debug Steps:
1. Check server logs for errors
2. Validate input data structure
3. Test with sample data first
4. Verify authentication token
5. Check database connectivity

This comprehensive test plan ensures the Energy Diagram Generator functions correctly across all scenarios and meets performance requirements. 