/**
 * Custom Diagram Rules Configuration
 * 
 * This file contains custom rules for the diagram generation system.
 * Rules are organized by category and executed in priority order.
 * 
 * Rule Structure:
 * - name: Unique identifier for the rule
 * - description: Human-readable description of what the rule does
 * - condition: Function that returns true if rule should be applied
 * - action: Function that returns the changes to apply
 * - priority: Higher numbers execute first (0-100)
 */

const customDiagramRules = {
    // Position Rules - Control where nodes are placed
    positionRules: [
        {
            name: 'always-wireless-on-top',
            description: 'Always place wireless devices and connections at the top level',
            condition: (node, context) => {
                return node.connectionType === 'wireless' || 
                       node.type === 'cloud' || 
                       (node.connections && node.connections.includes('wireless'));
            },
            action: (node, context) => ({ 
                position: { 
                    ...node.position, 
                    y: context.levels.top || 0 
                },
                level: 0,
                wirelessly_connected: true
            }),
            priority: 100
        },
        {
            name: 'high-capacity-special-positioning',
            description: 'Position high-capacity devices (>2500) in a dedicated area',
            condition: (node, context) => node.capacity && node.capacity > 2500,
            action: (node, context) => {
                const specialX = context.gridConfig.startX + (context.gridConfig.cellWidth * 6);
                return {
                    position: { 
                        x: specialX, 
                        y: node.position.y 
                    },
                    specialArea: 'high-capacity',
                    requiresEthernet: true
                };
            },
            priority: 95
        },
        {
            name: 'critical-devices-center',
            description: 'Place critical devices in the center for visibility',
            condition: (node, context) => node.critical === true,
            action: (node, context) => {
                const centerX = context.gridConfig.startX + (context.totalDevices * context.gridConfig.cellWidth / 2);
                return {
                    position: { 
                        x: centerX, 
                        y: node.position.y 
                    },
                    placement: 'center',
                    visibility: 'high'
                };
            },
            priority: 90
        },
        {
            name: 'panel-based-grouping',
            description: 'Group devices by electrical panel with spacing',
            condition: (node, context) => node.panel,
            action: (node, context) => {
                const panelOffset = context.panelOffsets?.[node.panel] || 0;
                return {
                    position: {
                        x: node.position.x + panelOffset,
                        y: node.position.y
                    },
                    groupedBy: 'panel'
                };
            },
            priority: 70
        }
    ],

    // Connection Rules - Control how nodes connect to each other
    connectionRules: [
        {
            name: 'smart-meter-onpremise-wire',
            description: 'All smart meters must connect to on-premise using wire (ethernet)',
            condition: (node, context) => node.type === 'smart-meter',
            action: (node, context) => ({ 
                connectionType: 'ethernet',
                preferredConnection: 'onpremise',
                forceWiredToOnpremise: true,
                reason: 'smart-meter-wire-requirement'
            }),
            priority: 100
        },
        {
            name: 'onpremise-cloud-wireless',
            description: 'On-premise connects to cloud with wireless',
            condition: (node, context) => node.type === 'onpremise',
            action: (node, context) => ({ 
                connectionType: 'wireless',
                preferredConnection: 'cloud',
                forceWirelessToCloud: true,
                reason: 'onpremise-cloud-wireless-requirement'
            }),
            priority: 99
        },
        {
            name: 'use-ethernet-for-large-capacity',
            description: 'Use ethernet connection for devices with capacity > 2500',
            condition: (node, context) => node.capacity && node.capacity > 2500,
            action: (node, context) => ({ 
                connectionType: 'ethernet',
                preferredConnection: 'onpremise',
                reason: 'high-capacity-requirement',
                bandwidthPriority: 'high'
            }),
            priority: 95
        },
        {
            name: 'wireless-backup-for-critical',
            description: 'Add wireless backup for critical ethernet devices',
            condition: (node, context) => {
                return node.critical === true && 
                       node.connectionType === 'ethernet';
            },
            action: (node, context) => ({
                backupConnection: 'wireless',
                redundancy: true,
                fallbackEnabled: true
            }),
            priority: 90
        },
        {
            name: 'smart-meter-priority-routing',
            description: 'Smart meters get priority routing through cloud',
            condition: (node, context) => node.type === 'smart-meter',
            action: (node, context) => ({
                requiredConnections: ['cloud', 'onpremise'],
                primaryConnection: 'cloud',
                connectionPriority: 'high',
                dataPath: 'priority'
            }),
            priority: 85
        },
        {
            name: 'location-based-routing',
            description: 'Route devices based on physical location proximity',
            condition: (node, context) => node.location,
            action: (node, context) => {
                const locationRouting = {
                    'building-a': 'onpremise',
                    'building-b': 'cloud',
                    'remote': 'wireless'
                };
                return {
                    preferredConnection: locationRouting[node.location] || 'onpremise',
                    locationAware: true
                };
            },
            priority: 65
        },
        {
            name: 'no-smart-meter-cloud-direct',
            description: 'Prevent smart meters from connecting directly to cloud - force through onpremise',
            condition: (node, context) => node.type === 'smart-meter',
            action: (node, context) => ({
                connectionType: 'ethernet',
                preferredConnection: 'onpremise',
                requiredConnections: ['onpremise'], // Only connect to onpremise, not cloud
                blockDirectCloudConnection: true,
                forceWiredToOnpremise: true,
                reason: 'security-policy-no-direct-cloud'
            }),
            priority: 98  // High priority to override other smart meter rules
        }
    ],

    // Anchor Rules - Control connection anchor points
    anchorRules: [
        {
            name: 'top-to-bottom-anchoring',
            description: 'Higher Y position (top layer like cloud) uses bottom anchor, lower layer uses top anchor',
            condition: (sourceNode, targetNode, context) => {
                return sourceNode && targetNode && sourceNode.position && targetNode.position;
            },
            action: (sourceNode, targetNode, context) => {
                const sourceY = sourceNode.position.y;
                const targetY = targetNode.position.y;
                
                // Determine which is higher (lower Y value means higher on screen)
                if (sourceY < targetY) {
                    // Source is higher, use bottom anchor for source, top anchor for target
                    return {
                        sourceAnchor: 'bottom',
                        targetAnchor: 'top',
                        reason: 'top-to-bottom-flow'
                    };
                } else if (sourceY > targetY) {
                    // Target is higher, use top anchor for source, bottom anchor for target
                    return {
                        sourceAnchor: 'top',
                        targetAnchor: 'bottom',
                        reason: 'bottom-to-top-flow'
                    };
                } else {
                    // Same level, use side anchors
                    return {
                        sourceAnchor: 'right',
                        targetAnchor: 'left',
                        reason: 'same-level-flow'
                    };
                }
            },
            priority: 90
        }
    ],

    // Styling Rules - Control visual appearance
    stylingRules: [
        {
            name: 'capacity-based-visual-coding',
            description: 'Visual coding based on device capacity',
            condition: (node, context) => node.capacity,
            action: (node, context) => {
                if (node.capacity > 5000) {
                    return {
                        size: 'extra-large',
                        color: '#D32F2F',     // Dark red for very high capacity
                        borderWidth: 4,
                        shape: 'diamond',
                        icon: 'high-voltage'
                    };
                } else if (node.capacity > 2500) {
                    return {
                        size: 'large',
                        color: '#FF5722',     // Orange-red for high capacity
                        borderWidth: 3,
                        shape: 'rectangle',
                        icon: 'electrical'
                    };
                } else {
                    return {
                        size: 'medium',
                        color: '#4CAF50',     // Green for normal capacity
                        borderWidth: 2,
                        shape: 'circle',
                        icon: 'meter'
                    };
                }
            },
            priority: 80
        },
        {
            name: 'connection-type-indicators',
            description: 'Visual indicators for connection types',
            condition: (node, context) => node.connectionType,
            action: (node, context) => {
                const connectionStyles = {
                    'wireless': {
                        borderStyle: 'dashed',
                        connectionIcon: 'wifi',
                        badgeColor: '#2196F3'
                    },
                    'ethernet': {
                        borderStyle: 'solid',
                        connectionIcon: 'ethernet',
                        badgeColor: '#4CAF50'
                    },
                    'rs485': {
                        borderStyle: 'dotted',
                        connectionIcon: 'serial',
                        badgeColor: '#FF9800'
                    }
                };
                return connectionStyles[node.connectionType] || {};
            },
            priority: 75
        },
        {
            name: 'status-with-animation',
            description: 'Animated status indicators',
            condition: (node, context) => node.status,
            action: (node, context) => {
                const statusAnimations = {
                    'active': { 
                        animation: 'pulse-green',
                        indicator: 'active-dot'
                    },
                    'warning': { 
                        animation: 'blink-orange',
                        indicator: 'warning-triangle'
                    },
                    'error': { 
                        animation: 'flash-red',
                        indicator: 'error-x'
                    },
                    'maintenance': { 
                        animation: 'rotate-blue',
                        indicator: 'maintenance-gear'
                    }
                };
                return statusAnimations[node.status] || {};
            },
            priority: 70
        }
    ],

    // Layout Rules - Control overall diagram organization
    layoutRules: [
        {
            name: 'wireless-devices-top-cluster',
            description: 'Cluster all wireless devices at the top of the diagram',
            condition: (nodes, context) => {
                return nodes.some(n => n.connectionType === 'wireless' || n.wirelessly_connected);
            },
            action: (nodes, context) => {
                const wirelessNodes = nodes.filter(n => 
                    n.connectionType === 'wireless' || n.wirelessly_connected
                );
                const otherNodes = nodes.filter(n => 
                    !(n.connectionType === 'wireless' || n.wirelessly_connected)
                );

                return {
                    clusters: {
                        wireless: {
                            nodes: wirelessNodes,
                            position: { x: 0, y: 0 },
                            layout: 'horizontal'
                        },
                        wired: {
                            nodes: otherNodes,
                            position: { x: 0, y: context.levels.middle },
                            layout: 'grid'
                        }
                    },
                    separationApplied: true
                };
            },
            priority: 85
        },
        {
            name: 'capacity-based-zones',
            description: 'Create zones based on device capacity levels',
            condition: (nodes, context) => {
                return nodes.some(n => n.capacity && n.capacity > 2500);
            },
            action: (nodes, context) => {
                const highCapacity = nodes.filter(n => n.capacity > 2500);
                const normalCapacity = nodes.filter(n => n.capacity <= 2500);

                return {
                    zones: {
                        'high-capacity': {
                            nodes: highCapacity,
                            area: { x: 0, y: 0, width: 200, height: 100 },
                            style: { backgroundColor: '#FFEBEE' }
                        },
                        'normal-capacity': {
                            nodes: normalCapacity,
                            area: { x: 220, y: 0, width: 300, height: 100 },
                            style: { backgroundColor: '#E8F5E8' }
                        }
                    }
                };
            },
            priority: 75
        },
        {
            name: 'critical-device-highlighting-layout',
            description: 'Special layout highlighting for critical devices',
            condition: (nodes, context) => {
                return nodes.some(n => n.critical === true);
            },
            action: (nodes, context) => {
                const criticalNodes = nodes.filter(n => n.critical);
                
                return {
                    criticalSection: {
                        nodes: criticalNodes,
                        position: 'center-top',
                        highlighting: {
                            background: '#FFF3E0',
                            border: '#FF5722',
                            label: 'CRITICAL DEVICES'
                        }
                    }
                };
            },
            priority: 80
        }
    ]
};

/**
 * Rule Templates - Common rule patterns that can be customized
 */
const ruleTemplates = {
    // Template for creating capacity-based rules
    createCapacityRule: (threshold, connectionType, priority = 70) => ({
        name: `capacity-rule-${threshold}`,
        description: `Use ${connectionType} for devices with capacity > ${threshold}`,
        condition: (node, context) => node.capacity && node.capacity > threshold,
        action: (node, context) => ({ connectionType }),
        priority
    }),

    // Template for creating location-based rules
    createLocationRule: (location, styling, priority = 60) => ({
        name: `location-rule-${location}`,
        description: `Special styling for devices in ${location}`,
        condition: (node, context) => node.location === location,
        action: (node, context) => styling,
        priority
    }),

    // Template for creating device-type specific rules
    createDeviceTypeRule: (deviceType, modifications, priority = 50) => ({
        name: `device-type-rule-${deviceType}`,
        description: `Specific rules for ${deviceType} devices`,
        condition: (node, context) => node.type === deviceType,
        action: (node, context) => modifications,
        priority
    })
};

/**
 * Quick rule configurations for common scenarios
 */
const quickConfigurations = {
    // Configuration optimized for industrial environments
    industrial: {
        positionRules: [
            customDiagramRules.positionRules[0], // wireless on top
            customDiagramRules.positionRules[1]  // high capacity positioning
        ],
        connectionRules: [
            customDiagramRules.connectionRules[0], // ethernet for high capacity
            customDiagramRules.connectionRules[1]  // wireless backup
        ]
    },

    // Configuration for residential/commercial buildings
    commercial: {
        stylingRules: [
            customDiagramRules.stylingRules[0], // capacity-based visual coding
            customDiagramRules.stylingRules[2]  // status with animation
        ],
        layoutRules: [
            customDiagramRules.layoutRules[0]   // wireless clustering
        ]
    },

    // Configuration emphasizing critical device management
    criticalFocus: {
        positionRules: [
            customDiagramRules.positionRules[2]  // critical devices center
        ],
        connectionRules: [
            customDiagramRules.connectionRules[1] // wireless backup for critical
        ],
        layoutRules: [
            customDiagramRules.layoutRules[2]    // critical device highlighting
        ]
    }
};

module.exports = {
    customDiagramRules,
    ruleTemplates,
    quickConfigurations
};

/* 
===========================================
🎯 ADD YOUR CUSTOM RULES HERE
===========================================

To add your own custom rules, uncomment and modify the examples below:

// Example 1: Add a custom position rule
customDiagramRules.positionRules.push({
    name: 'my-custom-position-rule',
    description: 'My custom positioning logic',
    condition: (node, context) => {
        // Add your condition here
        return node.someProperty === 'someValue';
    },
    action: (node, context) => {
        // Add your positioning logic here
        return {
            position: { 
                x: node.position.x + 50, 
                y: node.position.y 
            }
        };
    },
    priority: 85  // Adjust priority as needed
});

// Example 2: Add a custom styling rule
customDiagramRules.stylingRules.push({
    name: 'my-custom-styling-rule',
    description: 'My custom styling logic',
    condition: (node, context) => {
        // Add your condition here
        return node.myCustomProperty === true;
    },
    action: (node, context) => {
        // Add your styling logic here
        return {
            color: '#FF5722',
            borderWidth: 3,
            size: 'large'
        };
    },
    priority: 80
});

// Example 3: Add a custom connection rule
customDiagramRules.connectionRules.push({
    name: 'my-custom-connection-rule',
    description: 'My custom connection logic',
    condition: (node, context) => {
        // Add your condition here
        return node.deviceType === 'special-device';
    },
    action: (node, context) => {
        // Add your connection logic here
        return {
            connectionType: 'ethernet',
            preferredConnection: 'cloud'
        };
    },
    priority: 90
});

Remember to:
1. Give each rule a unique name
2. Set appropriate priority (higher numbers execute first)
3. Test your rules using the test script
4. Enable debug mode to see rule execution

*/ 