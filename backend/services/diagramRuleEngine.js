/**
 * DiagramRuleEngine - Flexible rule-based system for diagram design
 * Allows configuration of positioning, connection, styling, and layout rules
 */
class DiagramRuleEngine {
    constructor() {
        this.rules = new Map();
        this.defaultRules = this.loadDefaultRules();
        this.context = {};
    }

    /**
     * Load default rules for diagram generation
     */
    loadDefaultRules() {
        return {
            // Position Rules - Determine where nodes are placed
            positionRules: [
                {
                    name: 'wireless-on-top',
                    description: 'Place wireless connections at the top level',
                    condition: (node, context) => node.connectionType === 'wireless' || node.type === 'cloud',
                    action: (node, context) => ({ 
                        position: { ...node.position, y: context.levels.top }
                    }),
                    priority: 100
                },
                {
                    name: 'infrastructure-hierarchy',
                    description: 'Maintain infrastructure hierarchy (cloud > onpremise > devices)',
                    condition: (node, context) => node.type === 'onpremise',
                    action: (node, context) => ({ 
                        position: { ...node.position, y: context.levels.middle }
                    }),
                    priority: 95
                },
                {
                    name: 'meters-bottom-level',
                    description: 'Place meter devices at the bottom level',
                    condition: (node, context) => node.type && node.type.includes('meter'),
                    action: (node, context) => ({ 
                        position: { ...node.position, y: context.levels.bottom }
                    }),
                    priority: 90
                }
            ],

            // Connection Rules - Determine how nodes connect
            connectionRules: [
                {
                    name: 'high-capacity-ethernet',
                    description: 'Use ethernet for devices with capacity > 2500',
                    condition: (node, context) => node.capacity && node.capacity > 2500,
                    action: (node, context) => ({ 
                        connectionType: 'ethernet',
                        preferredConnection: 'onpremise'
                    }),
                    priority: 85
                },
                {
                    name: 'smart-meter-dual-connection',
                    description: 'Smart meters connect to both cloud and onpremise',
                    condition: (node, context) => node.type === 'smart-meter',
                    action: (node, context) => ({ 
                        requiredConnections: ['cloud', 'onpremise'],
                        primaryConnection: 'cloud'
                    }),
                    priority: 90
                },
                {
                    name: 'critical-device-redundancy',
                    description: 'Critical devices get redundant connections',
                    condition: (node, context) => node.critical === true,
                    action: (node, context) => ({ 
                        requiresBackup: true,
                        connectionType: 'ethernet'
                    }),
                    priority: 95
                }
            ],

            // Styling Rules - Determine visual appearance
            stylingRules: [
                {
                    name: 'status-based-coloring',
                    description: 'Color nodes based on their operational status',
                    condition: (node, context) => node.status,
                    action: (node, context) => {
                        const statusColors = {
                            'active': '#4CAF50',      // Green
                            'warning': '#FF9800',     // Orange
                            'error': '#F44336',       // Red
                            'inactive': '#9E9E9E',    // Gray
                            'maintenance': '#2196F3'  // Blue
                        };
                        return {
                            color: statusColors[node.status] || '#666666',
                            statusIndicator: true
                        };
                    },
                    priority: 80
                },
                {
                    name: 'capacity-based-sizing',
                    description: 'Size nodes based on their capacity',
                    condition: (node, context) => node.capacity,
                    action: (node, context) => {
                        let size = 'medium';
                        let borderWidth = 1;
                        
                        if (node.capacity > 5000) {
                            size = 'large';
                            borderWidth = 3;
                        } else if (node.capacity > 2500) {
                            size = 'medium';
                            borderWidth = 2;
                        } else {
                            size = 'small';
                            borderWidth = 1;
                        }
                        
                        return { size, borderWidth, capacityClass: size };
                    },
                    priority: 75
                },
                {
                    name: 'priority-highlighting',
                    description: 'Highlight high-priority devices',
                    condition: (node, context) => node.priority === 'high',
                    action: (node, context) => ({
                        borderColor: '#FF5722',
                        borderWidth: 3,
                        glow: true
                    }),
                    priority: 85
                }
            ],

            // Layout Rules - Determine overall diagram organization
            layoutRules: [
                {
                    name: 'panel-grouping',
                    description: 'Group devices by their electrical panel',
                    condition: (nodes, context) => nodes.some(n => n.panel),
                    action: (nodes, context) => this.groupByProperty(nodes, 'panel'),
                    priority: 70
                },
                {
                    name: 'location-separation',
                    description: 'Separate devices by physical location',
                    condition: (nodes, context) => nodes.some(n => n.location),
                    action: (nodes, context) => this.groupByProperty(nodes, 'location'),
                    priority: 65
                },
                {
                    name: 'critical-device-isolation',
                    description: 'Isolate critical devices in separate area',
                    condition: (nodes, context) => nodes.some(n => n.critical),
                    action: (nodes, context) => this.separateCriticalDevices(nodes),
                    priority: 80
                }
            ],

            // Anchor Rules - Determine connection anchor points
            anchorRules: [
                {
                    name: 'hierarchical-anchoring',
                    description: 'Set anchor points based on node hierarchy and position',
                    condition: (sourceNode, targetNode, context) => true,
                    action: (sourceNode, targetNode, context) => {
                        if (!sourceNode.position || !targetNode.position) {
                            return { sourceAnchor: 'center', targetAnchor: 'center' };
                        }
                        
                        const sourceY = sourceNode.position.y;
                        const targetY = targetNode.position.y;
                        
                        if (sourceY < targetY) {
                            return { sourceAnchor: 'bottom', targetAnchor: 'top' };
                        } else if (sourceY > targetY) {
                            return { sourceAnchor: 'top', targetAnchor: 'bottom' };
                        } else {
                            return { sourceAnchor: 'right', targetAnchor: 'left' };
                        }
                    },
                    priority: 50
                }
            ]
        };
    }

    /**
     * Add a custom rule to the engine
     */
    addRule(category, rule) {
        if (!this.rules.has(category)) {
            this.rules.set(category, []);
        }
        
        // Validate rule structure
        this.validateRule(rule);
        
        this.rules.get(category).push(rule);
        this.rules.get(category).sort((a, b) => b.priority - a.priority);
    }

    /**
     * Remove a rule by name
     */
    removeRule(category, ruleName) {
        if (this.rules.has(category)) {
            const rules = this.rules.get(category);
            const index = rules.findIndex(rule => rule.name === ruleName);
            if (index !== -1) {
                rules.splice(index, 1);
            }
        }
    }

    /**
     * Validate rule structure
     */
    validateRule(rule) {
        if (!rule.name || typeof rule.name !== 'string') {
            throw new Error('Rule must have a valid name');
        }
        if (!rule.condition || typeof rule.condition !== 'function') {
            throw new Error('Rule must have a valid condition function');
        }
        if (!rule.action || typeof rule.action !== 'function') {
            throw new Error('Rule must have a valid action function');
        }
        if (typeof rule.priority !== 'number') {
            throw new Error('Rule must have a valid priority number');
        }
    }

    /**
     * Apply rules to input (node or nodes array)
     */
    applyRules(category, input, context) {
        const allRules = [
            ...(this.defaultRules[category] || []),
            ...(this.rules.get(category) || [])
        ].sort((a, b) => b.priority - a.priority);

        let result = Array.isArray(input) ? [...input] : { ...input };
        
        // Preserve essential properties that should never be overwritten
        const preservedProperties = ['label', '_id', 'monitoringDeviceType'];
        const originalValues = {};
        
        if (!Array.isArray(input)) {
            preservedProperties.forEach(prop => {
                if (input[prop] !== undefined) {
                    originalValues[prop] = input[prop];
                }
            });
        }
        
        try {
            for (const rule of allRules) {
                if (rule.condition(result, context)) {
                    const ruleResult = rule.action(result, context);
                    
                    if (Array.isArray(input)) {
                        // For array inputs (layout rules)
                        result = ruleResult || result;
                    } else {
                        // For single node inputs - preserve essential properties
                        result = { ...result, ...ruleResult };
                        
                        // Restore preserved properties - always restore original values
                        preservedProperties.forEach(prop => {
                            if (originalValues[prop] !== undefined) {
                                result[prop] = originalValues[prop];
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error applying ${category} rules:`, error);
        }

        return result;
    }

    /**
     * Apply anchor rules for connections between two nodes
     */
    applyAnchorRules(sourceNode, targetNode, context) {
        const allRules = [
            ...(this.defaultRules.anchorRules || []),
            ...(this.rules.get('anchorRules') || [])
        ].sort((a, b) => b.priority - a.priority);

        let result = { sourceAnchor: 'center', targetAnchor: 'center' };
        
        try {
            console.log(`🔍 [ANCHOR DEBUG] Evaluating anchors for ${sourceNode.type} -> ${targetNode.type}`);
            console.log(`   Source position: (${sourceNode.position?.x}, ${sourceNode.position?.y})`);
            console.log(`   Target position: (${targetNode.position?.x}, ${targetNode.position?.y})`);
            console.log(`   Available anchor rules: ${allRules.length}`);
            
            for (const rule of allRules) {
                console.log(`   Testing rule: ${rule.name} (priority: ${rule.priority})`);
                if (rule.condition(sourceNode, targetNode, context)) {
                    const ruleResult = rule.action(sourceNode, targetNode, context);
                    result = { ...result, ...ruleResult };
                    console.log(`   ✅ APPLIED rule: ${rule.name} -> ${JSON.stringify(result)}`);
                    break; // Use first matching rule
                } else {
                    console.log(`   ❌ Rule ${rule.name} condition not met`);
                }
            }
            
            console.log(`   Final anchors: ${JSON.stringify(result)}`);
        } catch (error) {
            console.error('Error applying anchor rules:', error);
        }

        return result;
    }

    /**
     * Set global context for rule evaluation
     */
    setContext(context) {
        this.context = { ...this.context, ...context };
    }

    /**
     * Get all rules for a category
     */
    getRules(category) {
        return {
            default: this.defaultRules[category] || [],
            custom: this.rules.get(category) || []
        };
    }

    /**
     * Helper: Group nodes by a property
     */
    groupByProperty(nodes, property) {
        const groups = nodes.reduce((acc, node) => {
            const key = node[property] || 'default';
            if (!acc[key]) acc[key] = [];
            acc[key].push(node);
            return acc;
        }, {});

        return { groups, groupProperty: property };
    }

    /**
     * Helper: Separate critical devices
     */
    separateCriticalDevices(nodes) {
        const critical = nodes.filter(n => n.critical);
        const normal = nodes.filter(n => !n.critical);
        
        return {
            criticalDevices: critical,
            normalDevices: normal,
            separationApplied: true
        };
    }

    /**
     * Get rule engine statistics
     */
    getStats() {
        const stats = {
            defaultRules: {},
            customRules: {},
            total: 0
        };

        Object.keys(this.defaultRules).forEach(category => {
            stats.defaultRules[category] = this.defaultRules[category].length;
        });

        this.rules.forEach((rules, category) => {
            stats.customRules[category] = rules.length;
        });

        stats.total = Object.values(stats.defaultRules).reduce((a, b) => a + b, 0) +
                     Object.values(stats.customRules).reduce((a, b) => a + b, 0);

        return stats;
    }

    /**
     * Export current rule configuration
     */
    exportConfiguration() {
        const config = {
            customRules: {},
            context: this.context,
            timestamp: new Date().toISOString()
        };

        this.rules.forEach((rules, category) => {
            config.customRules[category] = rules.map(rule => ({
                name: rule.name,
                description: rule.description,
                priority: rule.priority,
                // Note: Functions cannot be serialized, would need special handling
                condition: rule.condition.toString(),
                action: rule.action.toString()
            }));
        });

        return config;
    }
}

module.exports = DiagramRuleEngine; 