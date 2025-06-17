const fs = require('fs').promises;
const path = require('path');
const DiagramRuleEngine = require('./diagramRuleEngine');

class EnergyDiagramGenerator {
    constructor(customRules = {}) {
        // Define node types and their properties (based on diagram-programming-language.md)
        this.nodeTypes = {
            'smart-meter': { 
                type: 'smart-meter', 
                requiredConnections: ['cloud', 'onpremise'],
                level: 2,
                color: '#4CAF50'
            },
            'general-meter': { 
                type: 'general-meter', 
                requiredConnections: ['onpremise'],
                level: 2,
                color: '#2196F3'
            },
            'memory-meter': { 
                type: 'memory-meter', 
                requiredConnections: ['onpremise'],
                level: 2,
                color: '#FF9800'
            },
            'auth-meter': { 
                type: 'auth-meter', 
                requiredConnections: ['onpremise'],
                level: 2,
                color: '#9C27B0'
            },
            'cloud': { 
                type: 'cloud', 
                level: 0,
                color: '#607D8B'
            },
            'onpremise': { 
                type: 'onpremise', 
                level: 1,
                color: '#795548'
            },
            'transformer': { 
                type: 'transformer', 
                level: 3,
                color: '#F44336'
            },
            'load': { 
                type: 'load', 
                level: 4,
                color: '#E91E63'
            }
        };

        // Supported device types from diagram programming language
        this.supportedDeviceTypes = [
            'smart-meter',      // Smart energy meter
            'general-meter',    // General purpose meter  
            'auth-meter',       // Authorization meter
            'memory-meter',     // Memory/storage meter
            'transformer',      // Electrical transformer
            'load',            // Electrical load
            'cloud',           // Cloud infrastructure
            'wireless',        // Wireless connection
            'rs485',           // RS485 connection
            'ethernet',        // Ethernet connection
            'onpremise'        // On-premise infrastructure
        ];

        // Define connection types between nodes
        this.connectionTypes = {
            'smart-meter': {
                'cloud': 'wireless',
                'onpremise': 'ethernet',
                'transformer': 'ethernet'
            },
            'general-meter': {
                'onpremise': 'rs485',
                'transformer': 'rs485'
            },
            'memory-meter': {
                'onpremise': 'rs485',
                'transformer': 'rs485'
            },
            'auth-meter': {
                'onpremise': 'ethernet',
                'transformer': 'ethernet'
            },
            'transformer': {
                'load': 'ethernet'
            }
        };

        // Grid layout configuration
        this.gridConfig = {
            cellWidth: 6,
            cellHeight: 4,
            startX: 0,
            startY: 0,
            levelSpacing: 8
        };

        // Initialize rule engine
        this.ruleEngine = new DiagramRuleEngine();
        this.loadCustomRules(customRules);
        this.debug = true; // Enable debug logging to trace label issues
    }

    /**
     * Load custom rules into the rule engine
     */
    loadCustomRules(customRules) {
        Object.entries(customRules).forEach(([category, rules]) => {
            if (Array.isArray(rules)) {
                rules.forEach(rule => {
                    try {
                        this.ruleEngine.addRule(category, rule);
                        if (this.debug) {
                            console.log(`Loaded custom rule: ${rule.name} in category: ${category}`);
                        }
                    } catch (error) {
                        console.error(`Failed to load rule ${rule.name}:`, error.message);
                    }
                });
            }
        });
    }

    /**
     * Add a rule dynamically
     */
    addRule(category, rule) {
        return this.ruleEngine.addRule(category, rule);
    }

    /**
     * Remove a rule by name
     */
    removeRule(category, ruleName) {
        return this.ruleEngine.removeRule(category, ruleName);
    }

    /**
     * Get rule engine statistics
     */
    getRuleStats() {
        return this.ruleEngine.getStats();
    }

    /**
     * Get node position by type from nodeIds and known positions
     */
    getNodePosition(nodeIds, nodeType) {
        // Define known positions for infrastructure nodes
        const knownPositions = {
            'cloud': { 
                x: this.gridConfig.startX + 4, 
                y: this.gridConfig.startY 
            },
            'onpremise': { 
                x: this.gridConfig.startX + 4, 
                y: this.gridConfig.startY + this.gridConfig.levelSpacing 
            }
        };

        return knownPositions[nodeType] || { x: 0, y: 0 };
    }

    /**
     * Generate diagram commands from energy monitoring data
     * @param {Array} energyMonitoringData - Array of energy monitoring devices
     * @param {Object} projectData - Additional project data
     * @returns {Object} - Generated commands and metadata
     */
    async generateDiagramCommands(energyMonitoringData, projectData = {}) {
        const commands = [];
        const nodePositions = new Map();
        const nodeIds = new Map();
        let nodeCounter = 1;

        // Step 1: Add infrastructure nodes (cloud and onpremise)
        const infrastructureNodes = this.addInfrastructureNodes(commands, nodePositions, nodeIds);

        // Step 2: Add energy monitoring devices with rule-based processing
        const meterNodes = this.addEnergyMonitoringDevices(
            commands, 
            energyMonitoringData, 
            nodePositions, 
            nodeIds, 
            nodeCounter
        );

        // Step 3: Add connections between nodes with rule-based enhancements
        this.addConnections(commands, energyMonitoringData, nodeIds, meterNodes);

        // Step 4: Add styling and properties
        this.addStyling(commands, nodeIds);

        // Step 5: Apply layout and grouping
        this.applyLayoutAndGrouping(commands, nodeIds, meterNodes);

        // Generate metadata
        const metadata = this.generateMetadata(energyMonitoringData, projectData);

        return {
            commands,
            metadata,
            nodePositions: Object.fromEntries(nodePositions),
            nodeIds: Object.fromEntries(nodeIds)
        };
    }

    /**
     * Add infrastructure nodes (cloud, onpremise)
     */
    addInfrastructureNodes(commands, nodePositions, nodeIds) {
        const infrastructureNodes = [];

        // Add cloud node at the top
        const cloudId = 'cloud-1';
        const cloudPos = { x: this.gridConfig.startX + 4, y: this.gridConfig.startY };
        commands.push(`add,cloud,${cloudPos.x},${cloudPos.y}`);
        nodePositions.set(cloudId, cloudPos);
        nodeIds.set('cloud', cloudId);
        infrastructureNodes.push(cloudId);

        // Add onpremise node below cloud
        const onpremiseId = 'onpremise-1';
        const onpremisePos = { 
            x: this.gridConfig.startX + 4, 
            y: this.gridConfig.startY + this.gridConfig.levelSpacing 
        };
        commands.push(`add,onpremise,${onpremisePos.x},${onpremisePos.y}`);
        nodePositions.set(onpremiseId, onpremisePos);
        nodeIds.set('onpremise', onpremiseId);
        infrastructureNodes.push(onpremiseId);

        return infrastructureNodes;
    }

    /**
     * Add energy monitoring devices with rule-based processing
     */
    addEnergyMonitoringDevices(commands, energyMonitoringData, nodePositions, nodeIds, nodeCounter) {
        const meterNodes = [];
        let currentX = this.gridConfig.startX;
        const meterY = this.gridConfig.startY + (this.gridConfig.levelSpacing * 2);

        // Create context for rules
        const context = {
            levels: {
                top: this.gridConfig.startY,
                middle: this.gridConfig.startY + this.gridConfig.levelSpacing,
                bottom: this.gridConfig.startY + (this.gridConfig.levelSpacing * 2)
            },
            gridConfig: this.gridConfig,
            totalDevices: energyMonitoringData.length,
            panelOffsets: this.calculatePanelOffsets(energyMonitoringData)
        };

        // Set context in rule engine
        this.ruleEngine.setContext(context);

        energyMonitoringData.forEach((meter, index) => {
            const meterType = meter.monitoringDeviceType;
            if (!this.nodeTypes[meterType]) {
                console.warn(`Unknown meter type: ${meterType}. Skipping device: ${meter.label || 'Unknown'}`);
                return;
            }

            // Create enhanced node data with all available properties
            let nodeData = {
                ...meter,
                type: meterType,
                label: meter.label || meter.name, // Explicitly preserve the label
                position: {
                    x: currentX + (index * this.gridConfig.cellWidth),
                    y: meterY
                },
                capacity: parseInt(meter.capacity) || 0,
                priority: meter.priority || 'normal',
                critical: meter.critical === true || meter.critical === 'true',
                connectionType: meter.connectionType || this.getDefaultConnectionType(meterType),
                index: index
            };

            if (this.debug) {
                console.log(`🔍 [METER DEBUG] Initial data for ${meter._id}:`, {
                    meterLabel: meter.label,
                    nodeDataLabel: nodeData.label,
                    meterType: meterType,
                    allMeterProperties: Object.keys(meter),
                    labelExists: !!meter.label,
                    labelValue: meter.label
                });
            }

            // Store original label before rule processing
            const originalLabel = meter.label || meter.name;
            
            // Apply position rules
            nodeData = this.ruleEngine.applyRules('positionRules', nodeData, context);

            // Apply connection rules  
            nodeData = this.ruleEngine.applyRules('connectionRules', nodeData, context);

            // Apply styling rules
            nodeData = this.ruleEngine.applyRules('stylingRules', nodeData, context);
            
            // Ensure original label is preserved after rule processing
            if (originalLabel && (!nodeData.label || nodeData.label === 'undefined')) {
                nodeData.label = originalLabel;
            }
            
            if (this.debug) {
                console.log(`🔍 [METER DEBUG] After rules for ${meter._id}:`, {
                    labelAfterRules: nodeData.label,
                    labelExists: !!nodeData.label
                });
            }

            // Generate unique node ID
            const nodeId = `${meterType}-${nodeCounter++}`;
            
            // Add meter node with applied position
            commands.push(`add,${meterType},${nodeData.position.x},${nodeData.position.y}`);
            
            // Apply all node properties based on rules and original data
            this.applyNodeProperties(commands, nodeId, nodeData);

            // Store position and ID
            nodePositions.set(nodeId, nodeData.position);
            nodeIds.set(`meter-${meter._id || index}`, nodeId);
            meterNodes.push({ nodeId, data: nodeData });

            if (this.debug) {
                console.log(`Processed device ${nodeData.label} with rules applied:`, {
                    position: nodeData.position,
                    connectionType: nodeData.connectionType,
                    styling: {
                        color: nodeData.color,
                        size: nodeData.size
                    }
                });
            }
        });

        // Apply layout rules to all nodes
        const layoutResult = this.ruleEngine.applyRules('layoutRules', meterNodes, context);
        this.applyLayoutRules(commands, layoutResult, nodeIds);

        return meterNodes;
    }

    /**
     * Calculate panel offsets for grouping
     */
    calculatePanelOffsets(energyMonitoringData) {
        const panels = [...new Set(energyMonitoringData.map(m => m.panel).filter(Boolean))];
        const offsets = {};
        panels.forEach((panel, index) => {
            offsets[panel] = index * this.gridConfig.cellWidth * 3; // 3 device widths per panel
        });
        return offsets;
    }

    /**
     * Get default connection type for meter type
     */
    getDefaultConnectionType(meterType) {
        const defaultConnections = {
            'smart-meter': 'wireless',
            'general-meter': 'rs485',
            'memory-meter': 'rs485',
            'auth-meter': 'ethernet'
        };
        return defaultConnections[meterType] || 'ethernet';
    }

    /**
     * Apply node properties based on rule results
     */
    applyNodeProperties(commands, nodeId, nodeData) {
        // Apply label - use the actual device label, fallback to properly formatted type if label doesn't exist
        const deviceLabel = (nodeData.label && nodeData.label.trim()) 
            ? nodeData.label 
            : nodeData.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
        if (this.debug) {
            console.log(`📝 [LABEL DEBUG] ${nodeId}:`, {
                originalLabel: nodeData.label,
                hasLabel: !!(nodeData.label && nodeData.label.trim()),
                fallbackLabel: nodeData.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                finalLabel: deviceLabel
            });
        }
        
        commands.push(`set-property,${nodeId},label,${deviceLabel}`);

        // Apply rule-based styling properties
        if (nodeData.color) {
            commands.push(`style,${nodeId},color,${nodeData.color}`);
        }
        if (nodeData.size) {
            commands.push(`style,${nodeId},size,${nodeData.size}`);
        }
        if (nodeData.borderWidth) {
            commands.push(`style,${nodeId},border-width,${nodeData.borderWidth}`);
        }
        if (nodeData.borderColor) {
            commands.push(`style,${nodeId},border-color,${nodeData.borderColor}`);
        }
        if (nodeData.shape) {
            commands.push(`style,${nodeId},shape,${nodeData.shape}`);
        }
        if (nodeData.borderStyle) {
            commands.push(`style,${nodeId},border-style,${nodeData.borderStyle}`);
        }

        // Apply animation properties
        if (nodeData.animation) {
            commands.push(`animate,${nodeId},${nodeData.animation}`);
        }

        // Apply rule-based connection properties
        if (nodeData.connectionType) {
            commands.push(`set-property,${nodeId},connectionType,${nodeData.connectionType}`);
        }

        // Apply original properties
        ['panel', 'description', 'status', 'connection', 'capacity', 'priority'].forEach(prop => {
            if (nodeData[prop] !== undefined && nodeData[prop] !== null) {
                commands.push(`set-property,${nodeId},${prop},${nodeData[prop]}`);
            }
        });

        // Apply special rule-based properties
        if (nodeData.critical) {
            commands.push(`set-property,${nodeId},critical,true`);
        }
        if (nodeData.specialArea) {
            commands.push(`set-property,${nodeId},specialArea,${nodeData.specialArea}`);
        }
        if (nodeData.requiresBackup) {
            commands.push(`set-property,${nodeId},requiresBackup,true`);
        }
    }

    /**
     * Apply layout rules results
     */
    applyLayoutRules(commands, layoutResult, nodeIds) {
        if (!layoutResult || typeof layoutResult !== 'object') return;

        // Handle clustering
        if (layoutResult.clusters) {
            Object.entries(layoutResult.clusters).forEach(([clusterName, cluster]) => {
                if (cluster.nodes && cluster.nodes.length > 0) {
                    const nodeIdList = cluster.nodes.map(n => n.nodeId).join(',');
                    commands.push(`group,${clusterName}-cluster,${nodeIdList}`);
                    
                    if (cluster.layout) {
                        commands.push(`layout-group,${clusterName}-cluster,${cluster.layout}`);
                    }
                }
            });
        }

        // Handle zones
        if (layoutResult.zones) {
            Object.entries(layoutResult.zones).forEach(([zoneName, zone]) => {
                if (zone.nodes && zone.nodes.length > 0) {
                    const nodeIdList = zone.nodes.map(n => n.nodeId).join(',');
                    commands.push(`create-zone,${zoneName},${nodeIdList}`);
                    
                    if (zone.style) {
                        Object.entries(zone.style).forEach(([prop, value]) => {
                            commands.push(`style-zone,${zoneName},${prop},${value}`);
                        });
                    }
                }
            });
        }

        // Handle critical section
        if (layoutResult.criticalSection) {
            const section = layoutResult.criticalSection;
            if (section.nodes && section.nodes.length > 0) {
                const nodeIdList = section.nodes.map(n => n.nodeId).join(',');
                commands.push(`create-section,critical,${nodeIdList}`);
                
                if (section.highlighting) {
                    Object.entries(section.highlighting).forEach(([prop, value]) => {
                        commands.push(`style-section,critical,${prop},${value}`);
                    });
                }
            }
        }
    }

    /**
     * Add connections between nodes with rule-based connection types
     */
    addConnections(commands, energyMonitoringData, nodeIds, meterNodes = []) {
        // Create context for anchor rules
        const context = {
            levels: {
                top: this.gridConfig.startY,
                middle: this.gridConfig.startY + this.gridConfig.levelSpacing,
                bottom: this.gridConfig.startY + (this.gridConfig.levelSpacing * 2)
            },
            gridConfig: this.gridConfig,
            totalDevices: energyMonitoringData.length
        };

        // Enhanced connection logic using rule-applied data
        meterNodes.forEach((meterNode, index) => {
            const { nodeId, data } = meterNode;
            const meterType = data.type;
            
            if (!this.nodeTypes[meterType]) return;

            // Rule 1: Smart meters must connect to on-premise using wire
            if (meterType === 'smart-meter' && data.forceWiredToOnpremise) {
                const onpremiseId = nodeIds.get('onpremise');
                if (onpremiseId) {
                    // Get anchor positions for connection
                    const sourceNodeData = { position: data.position, type: meterType };
                    const targetNodeData = { position: this.getNodePosition(nodeIds, 'onpremise'), type: 'onpremise' };
                    const anchors = this.ruleEngine.applyAnchorRules(sourceNodeData, targetNodeData, context);
                    
                    commands.push(`connect,${nodeId},${onpremiseId},ethernet,${anchors.sourceAnchor},${anchors.targetAnchor}`);
                    if (this.debug) {
                        console.log(`Smart meter ${data.label} connected to on-premise with ethernet (Rule 1)`);
                    }
                }
            }

            // Check if rules explicitly block cloud connections
            if (data.blockDirectCloudConnection && this.debug) {
                console.log(`🚫 Rule blocking direct cloud connection for ${data.label} (${data.reason})`);
            }

            // Use rule-applied connection requirements or defaults
            const requiredConnections = data.requiredConnections || 
                                      this.nodeTypes[meterType].requiredConnections || [];
            
            // Filter out blocked connections based on rules
            const allowedConnections = requiredConnections.filter(targetType => {
                if (data.blockDirectCloudConnection && targetType === 'cloud') {
                    if (this.debug) {
                        console.log(`🚫 Skipping cloud connection for ${data.label} - blocked by rule`);
                    }
                    return false;
                }
                return true;
            });
            
            allowedConnections.forEach(targetType => {
                const targetNodeId = nodeIds.get(targetType);
                if (targetNodeId) {
                    // Skip if already handled by specific rules above
                    if (meterType === 'smart-meter' && targetType === 'onpremise' && data.forceWiredToOnpremise) {
                        return;
                    }

                    // Use rule-applied connection type or default
                    let connectionType = data.connectionType || 
                                       this.connectionTypes[meterType]?.[targetType] || 
                                       'ethernet';
                    
                    // Apply high-capacity ethernet rule
                    if (data.requiresEthernet || (data.capacity && data.capacity > 2500)) {
                        connectionType = 'ethernet';
                    }
                    
                    // Get anchor positions for connection
                    const sourceNodeData = { position: data.position, type: meterType };
                    const targetNodeData = { position: this.getNodePosition(nodeIds, targetType), type: targetType };
                    const anchors = this.ruleEngine.applyAnchorRules(sourceNodeData, targetNodeData, context);
                    
                    commands.push(`connect,${nodeId},${targetNodeId},${connectionType},${anchors.sourceAnchor},${anchors.targetAnchor}`);
                    
                    if (this.debug) {
                        console.log(`✅ Connected ${data.label} to ${targetType} via ${connectionType}`);
                    }
                    
                    // Add backup connection if required by rules
                    if (data.requiresBackup && data.backupConnection) {
                        commands.push(`connect,${nodeId},${targetNodeId},${data.backupConnection},backup,${anchors.sourceAnchor},${anchors.targetAnchor}`);
                    }
                }
            });

            // Handle preferred connections from rules
            if (data.preferredConnection) {
                const preferredTargetId = nodeIds.get(data.preferredConnection);
                if (preferredTargetId) {
                    const connectionType = data.connectionType || 'ethernet';
                    
                    const sourceNodeData = { position: data.position, type: meterType };
                    const targetNodeData = { position: this.getNodePosition(nodeIds, data.preferredConnection), type: data.preferredConnection };
                    const anchors = this.ruleEngine.applyAnchorRules(sourceNodeData, targetNodeData, context);
                    
                    commands.push(`connect,${nodeId},${preferredTargetId},${connectionType},preferred,${anchors.sourceAnchor},${anchors.targetAnchor}`);
                }
            }
        });

        // Fallback for devices not processed by rules
        energyMonitoringData.forEach((meter, index) => {
            const meterType = meter.monitoringDeviceType;
            const meterNodeId = nodeIds.get(`meter-${meter._id || index}`);
            
            if (!meterNodeId || !this.nodeTypes[meterType]) return;

            // Check if this device was already processed by rules
            const alreadyProcessed = meterNodes.some(mn => 
                nodeIds.get(`meter-${meter._id || index}`) === mn.nodeId
            );
            
            if (!alreadyProcessed) {
                const requiredConnections = this.nodeTypes[meterType].requiredConnections || [];
                
                requiredConnections.forEach(targetType => {
                    const targetNodeId = nodeIds.get(targetType);
                    if (targetNodeId) {
                        const connectionType = this.connectionTypes[meterType]?.[targetType] || 'ethernet';
                        commands.push(`connect,${meterNodeId},${targetNodeId},${connectionType}`);
                    }
                });
            }
        });

        // Rule 2: On-premise connects to cloud with wireless
        const cloudId = nodeIds.get('cloud');
        const onpremiseId = nodeIds.get('onpremise');
        if (cloudId && onpremiseId) {
            // Get positions for anchor calculation
            const cloudPosition = this.getNodePosition(nodeIds, 'cloud');
            const onpremisePosition = this.getNodePosition(nodeIds, 'onpremise');
            
            const sourceNodeData = { position: onpremisePosition, type: 'onpremise' };
            const targetNodeData = { position: cloudPosition, type: 'cloud' };
            const anchors = this.ruleEngine.applyAnchorRules(sourceNodeData, targetNodeData, context);
            
            commands.push(`connect,${onpremiseId},${cloudId},wireless,${anchors.sourceAnchor},${anchors.targetAnchor}`);
            
            if (this.debug) {
                console.log('On-premise connected to cloud with wireless (Rule 2)');
            }
        }

        if (this.debug) {
            console.log('Connections created with rule-based enhancements');
        }
    }

    /**
     * Add styling to nodes
     */
    addStyling(commands, nodeIds) {
        // Style infrastructure nodes
        const cloudId = nodeIds.get('cloud');
        const onpremiseId = nodeIds.get('onpremise');
        
        if (cloudId) {
            commands.push(`style,${cloudId},color,${this.nodeTypes.cloud.color}`);
            commands.push(`style,${cloudId},shape,cloud`);
        }
        
        if (onpremiseId) {
            commands.push(`style,${onpremiseId},color,${this.nodeTypes.onpremise.color}`);
            commands.push(`style,${onpremiseId},shape,server`);
        }

        // Style meter nodes based on their type
        nodeIds.forEach((nodeId, key) => {
            if (key.startsWith('meter-')) {
                // Extract meter type from node ID
                const meterType = nodeId.split('-')[0];
                if (this.nodeTypes[meterType]) {
                    commands.push(`style,${nodeId},color,${this.nodeTypes[meterType].color}`);
                    commands.push(`style,${nodeId},shape,rectangle`);
                }
            }
        });
    }

    /**
     * Apply layout and grouping
     */
    applyLayoutAndGrouping(commands, nodeIds, meterNodes) {
        // Apply hierarchical layout
        commands.push('layout,hierarchical');

        // Group meters by type
        const meterGroups = {};
        meterNodes.forEach(meterNode => {
            // Handle both old format (string) and new format (object)
            const nodeId = typeof meterNode === 'string' ? meterNode : meterNode.nodeId;
            const nodeData = typeof meterNode === 'object' ? meterNode.data : null;
            
            // Get meter type from node data or extract from nodeId
            const meterType = nodeData ? nodeData.type : nodeId.split('-')[0];
            
            if (!meterGroups[meterType]) {
                meterGroups[meterType] = [];
            }
            meterGroups[meterType].push(nodeId);
        });

        // Create groups
        Object.entries(meterGroups).forEach(([meterType, nodes]) => {
            if (nodes.length > 1) {
                const groupName = `${meterType}-group`;
                commands.push(`group,${groupName},${nodes.join(',')}`);
                
                // Style the group
                const color = this.nodeTypes[meterType]?.color || '#666666';
                commands.push(`style-group,${groupName},border-color,${color}`);
            }
        });

        // Create main infrastructure group
        const cloudId = nodeIds.get('cloud');
        const onpremiseId = nodeIds.get('onpremise');
        if (cloudId && onpremiseId) {
            commands.push(`group,infrastructure,${cloudId},${onpremiseId}`);
            commands.push(`style-group,infrastructure,border-color,#333333`);
        }

        // Fit all nodes in view
        commands.push('fit');
    }

    /**
     * Generate metadata for the diagram
     */
    generateMetadata(energyMonitoringData, projectData) {
        const meterTypes = [...new Set(energyMonitoringData.map(m => m.monitoringDeviceType))];
        const totalDevices = energyMonitoringData.length;
        
        return {
            generatedAt: new Date().toISOString(),
            version: '1.0',
            diagramType: 'energy-monitoring',
            nodeCount: totalDevices + 2, // +2 for cloud and onpremise
            meterTypes: meterTypes,
            deviceCount: totalDevices,
            projectId: projectData.projectId,
            projectName: projectData.projectName,
            generator: 'EnergyDiagramGenerator',
            devices: energyMonitoringData.map(device => ({
                id: device._id,
                label: device.label,
                type: device.monitoringDeviceType,
                panel: device.panel,
                status: device.status
            }))
        };
    }

    /**
     * Save commands to JSON file
     */
    async saveCommandsToFile(commands, metadata, projectId) {
        const outputDir = path.join(process.cwd(), 'output', 'diagrams');
        await fs.mkdir(outputDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `energy-diagram-${projectId}-${timestamp}.json`;
        const filePath = path.join(outputDir, filename);

        const diagramData = {
            commands,
            metadata,
            executionInstructions: {
                description: 'Execute commands in sequence on the frontend diagram engine',
                commandFormat: 'Each command follows the diagram programming language specification',
                executionOrder: 'Commands must be executed in the order provided'
            }
        };

        await fs.writeFile(filePath, JSON.stringify(diagramData, null, 2), 'utf8');
        return { filePath, filename, diagramData };
    }
}

module.exports = EnergyDiagramGenerator; 