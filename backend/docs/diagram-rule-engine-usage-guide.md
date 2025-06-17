# DiagramRuleEngine Usage Guide

## Overview

The DiagramRuleEngine is a flexible system that allows you to customize diagram generation without modifying core code. It's already integrated into your `EnergyDiagramGenerator` and ready to use.

## 📁 File Structure

```
backend/
├── services/
│   ├── diagramRuleEngine.js         # Core rule engine (don't modify)
│   └── energyDiagramGenerator.js    # Integration point (already set up)
├── config/
│   └── diagramRules.js              # ⭐ YOUR CUSTOM RULES GO HERE
└── tests/
    └── ruleBasedDiagramGenerator.test.js  # Test examples
```

## 🎯 Where to Write Your Rules

**Main Configuration File:** `backend/config/diagramRules.js`

This file contains:
- `customDiagramRules` - Your custom rule definitions
- `ruleTemplates` - Reusable rule patterns
- `quickConfigurations` - Pre-built rule sets

## 📝 Rule Categories

### 1. **Position Rules** - Control node placement

```javascript
// Add to: customDiagramRules.positionRules
{
  name: 'my-custom-positioning',
  description: 'Place high-priority devices in center',
  condition: (node, context) => node.priority === 'high',
  action: (node, context) => ({
    position: { 
      x: context.gridConfig.startX + 100,
      y: node.position.y 
    }
  }),
  priority: 90
}
```

### 2. **Connection Rules** - Control how nodes connect

```javascript
// Add to: customDiagramRules.connectionRules
{
  name: 'ethernet-for-servers',
  description: 'Use ethernet for server devices',
  condition: (node, context) => node.type === 'server',
  action: (node, context) => ({ 
    connectionType: 'ethernet',
    preferredConnection: 'onpremise'
  }),
  priority: 85
}
```

### 3. **Styling Rules** - Control visual appearance

```javascript
// Add to: customDiagramRules.stylingRules
{
  name: 'red-for-offline',
  description: 'Color offline devices red',
  condition: (node, context) => node.status === 'offline',
  action: (node, context) => ({
    color: '#F44336',
    borderWidth: 3,
    icon: 'warning'
  }),
  priority: 80
}
```

### 4. **Layout Rules** - Control overall organization

```javascript
// Add to: customDiagramRules.layoutRules
{
  name: 'group-by-building',
  description: 'Group devices by building',
  condition: (nodes, context) => nodes.some(n => n.building),
  action: (nodes, context) => {
    const groups = nodes.reduce((acc, node) => {
      const building = node.building || 'default';
      if (!acc[building]) acc[building] = [];
      acc[building].push(node);
      return acc;
    }, {});
    
    return { groups, groupProperty: 'building' };
  },
  priority: 70
}
```

### 5. **Anchor Rules** - Control connection anchor points

```javascript
// Add to: customDiagramRules.anchorRules
{
  name: 'smart-anchoring',
  description: 'Smart anchor point selection',
  condition: (sourceNode, targetNode, context) => true,
  action: (sourceNode, targetNode, context) => {
    // Custom anchor logic
    return { 
      sourceAnchor: 'bottom', 
      targetAnchor: 'top' 
    };
  },
  priority: 90
}
```

## 🚀 How to Use Rules

### **Method 1: Edit the Configuration File**

Open `backend/config/diagramRules.js` and add your rules:

```javascript
const customDiagramRules = {
  positionRules: [
    // ... existing rules ...
    {
      name: 'my-new-rule',
      description: 'My custom positioning rule',
      condition: (node, context) => node.myProperty === 'myValue',
      action: (node, context) => ({ position: { x: 100, y: 200 } }),
      priority: 85
    }
  ],
  
  connectionRules: [
    // ... add your connection rules here ...
  ],
  
  stylingRules: [
    // ... add your styling rules here ...
  ]
};
```

### **Method 2: Use Rule Templates**

```javascript
const { ruleTemplates } = require('../config/diagramRules');

// Create a capacity-based rule
const capacityRule = ruleTemplates.createCapacityRule(3000, 'ethernet', 80);

// Create a location-based rule
const locationRule = ruleTemplates.createLocationRule('building-a', { 
  color: '#E3F2FD' 
}, 70);

// Add them to your configuration
customDiagramRules.connectionRules.push(capacityRule);
customDiagramRules.stylingRules.push(locationRule);
```

### **Method 3: Dynamic Rule Addition**

In your service or controller:

```javascript
const EnergyDiagramGenerator = require('../services/energyDiagramGenerator');

const generator = new EnergyDiagramGenerator();

// Add a rule dynamically
generator.addRule('positionRules', {
  name: 'runtime-rule',
  description: 'Added at runtime',
  condition: (node, context) => node.special === true,
  action: (node, context) => ({ position: { x: 0, y: 0 } }),
  priority: 95
});
```

## 📊 Quick Configurations

Use pre-built rule sets for common scenarios:

```javascript
const { quickConfigurations } = require('../config/diagramRules');

// Industrial setup
const industrialGenerator = new EnergyDiagramGenerator(quickConfigurations.industrial);

// Commercial setup
const commercialGenerator = new EnergyDiagramGenerator(quickConfigurations.commercial);

// Critical device focus
const criticalGenerator = new EnergyDiagramGenerator(quickConfigurations.criticalFocus);
```

## 🧪 Testing Your Rules

### **1. Use the Test File**

Run the existing test to see how rules work:

```bash
node backend/tests/ruleBasedDiagramGenerator.test.js
```

### **2. Create Your Own Test**

```javascript
const EnergyDiagramGenerator = require('../services/energyDiagramGenerator');

// Test data
const testData = [
  {
    _id: '1',
    label: 'Test Device',
    monitoringDeviceType: 'smart-meter',
    capacity: 3000,
    priority: 'high'
  }
];

// Test your rules
async function testMyRules() {
  const generator = new EnergyDiagramGenerator();
  
  // Add your custom rule
  generator.addRule('stylingRules', {
    name: 'test-rule',
    condition: (node) => node.priority === 'high',
    action: (node) => ({ color: '#FF0000' }),
    priority: 90
  });
  
  const result = await generator.generateDiagramCommands(testData);
  console.log('Generated commands:', result.commands);
}

testMyRules();
```

## 🎛️ Rule Context

Rules receive a `context` object with useful information:

```javascript
{
  levels: {
    top: 0,          // Y position for top level
    middle: 8,       // Y position for middle level  
    bottom: 16       // Y position for bottom level
  },
  gridConfig: {
    cellWidth: 6,    // Grid cell width
    cellHeight: 4,   // Grid cell height
    startX: 0,       // Starting X position
    startY: 0,       // Starting Y position
    levelSpacing: 8  // Space between levels
  },
  totalDevices: 5,   // Total number of devices
  panelOffsets: {    // Calculated panel grouping offsets
    'Panel A': 0,
    'Panel B': 30
  }
}
```

## 🔧 Common Rule Patterns

### **Conditional Styling**
```javascript
{
  name: 'conditional-coloring',
  condition: (node) => node.status,
  action: (node) => {
    const colors = {
      'active': '#4CAF50',
      'warning': '#FF9800', 
      'error': '#F44336'
    };
    return { color: colors[node.status] || '#666666' };
  },
  priority: 80
}
```

### **Capacity-Based Layout**
```javascript
{
  name: 'size-by-capacity',
  condition: (node) => node.capacity,
  action: (node) => {
    if (node.capacity > 5000) return { size: 'large' };
    if (node.capacity > 2000) return { size: 'medium' };
    return { size: 'small' };
  },
  priority: 75
}
```

### **Location-Based Grouping**
```javascript
{
  name: 'location-grouping',
  condition: (nodes) => nodes.some(n => n.location),
  action: (nodes) => {
    const groups = {};
    nodes.forEach(node => {
      const loc = node.location || 'default';
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(node);
    });
    return { groups, groupProperty: 'location' };
  },
  priority: 70
}
```

## 🚨 Important Notes

1. **Rule Priority**: Higher numbers (90-100) execute first
2. **Rule Conflicts**: Higher priority rules override lower ones
3. **Essential Properties**: Some properties like `label` and `_id` are protected
4. **Performance**: Rules are cached and optimized automatically
5. **Error Handling**: Failed rules don't break diagram generation

## 🔍 Debugging Rules

Enable debug mode to see rule execution:

```javascript
const generator = new EnergyDiagramGenerator();
generator.debug = true;  // Enable debug logging

// You'll see logs like:
// "Loaded custom rule: my-rule in category: positionRules"
// "Applied rule: my-rule with result: {...}"
```

## 📖 Real Examples

Check these files for working examples:
- `backend/config/diagramRules.js` - Complete rule configurations
- `backend/tests/ruleBasedDiagramGenerator.test.js` - Test examples
- `backend/controllers/energyDiagramController.js` - Integration usage

## 🤝 Integration with API

The rules automatically work with your existing API endpoints:

```http
POST /api/projects/:projectId/energy-diagram/generate
```

The `EnergyDiagramController` already loads custom rules:

```javascript
const { customDiagramRules } = require('../config/diagramRules');
this.diagramGenerator = new EnergyDiagramGenerator(customDiagramRules);
```

## 🎯 Next Steps

1. **Open** `backend/config/diagramRules.js`
2. **Add** your custom rules to the appropriate category
3. **Test** using the API or test scripts
4. **Debug** with `generator.debug = true`
5. **Iterate** and refine your rules

The system is ready to use - just add your rules to the configuration file! 