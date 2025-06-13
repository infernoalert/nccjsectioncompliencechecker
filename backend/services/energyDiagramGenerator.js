const fs = require('fs').promises;
const path = require('path');

class EnergyDiagramGenerator {
    constructor() {
        // Define node types and their properties
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

        // Step 2: Add energy monitoring devices
        const meterNodes = this.addEnergyMonitoringDevices(
            commands, 
            energyMonitoringData, 
            nodePositions, 
            nodeIds, 
            nodeCounter
        );

        // Step 3: Add connections between nodes
        this.addConnections(commands, energyMonitoringData, nodeIds);

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
     * Add energy monitoring devices
     */
    addEnergyMonitoringDevices(commands, energyMonitoringData, nodePositions, nodeIds, nodeCounter) {
        const meterNodes = [];
        let currentX = this.gridConfig.startX;
        const meterY = this.gridConfig.startY + (this.gridConfig.levelSpacing * 2);

        energyMonitoringData.forEach((meter, index) => {
            const meterType = meter.monitoringDeviceType;
            if (!this.nodeTypes[meterType]) {
                console.warn(`Unknown meter type: ${meterType}`);
                return;
            }

            // Calculate position
            const position = {
                x: currentX + (index * this.gridConfig.cellWidth),
                y: meterY
            };

            // Generate unique node ID
            const nodeId = `${meterType}-${nodeCounter++}`;
            
            // Add meter node
            commands.push(`add,${meterType},${position.x},${position.y}`);
            
            // Set label property
            const label = meter.label || `${meterType.replace('-', ' ').toUpperCase()}`;
            commands.push(`set-property,${nodeId},label,${label}`);
            
            // Set panel property if available
            if (meter.panel) {
                commands.push(`set-property,${nodeId},panel,${meter.panel}`);
            }

            // Set description if available
            if (meter.description) {
                commands.push(`set-property,${nodeId},description,${meter.description}`);
            }

            // Store position and ID
            nodePositions.set(nodeId, position);
            nodeIds.set(`meter-${meter._id || index}`, nodeId);
            meterNodes.push(nodeId);
        });

        return meterNodes;
    }

    /**
     * Add connections between nodes
     */
    addConnections(commands, energyMonitoringData, nodeIds) {
        energyMonitoringData.forEach((meter, index) => {
            const meterType = meter.monitoringDeviceType;
            const meterNodeId = nodeIds.get(`meter-${meter._id || index}`);
            
            if (!meterNodeId || !this.nodeTypes[meterType]) return;

            const requiredConnections = this.nodeTypes[meterType].requiredConnections || [];
            
            requiredConnections.forEach(targetType => {
                const targetNodeId = nodeIds.get(targetType);
                if (targetNodeId) {
                    const connectionType = this.connectionTypes[meterType]?.[targetType] || 'ethernet';
                    commands.push(`connect,${meterNodeId},${targetNodeId},${connectionType}`);
                }
            });
        });

        // Connect cloud to onpremise
        const cloudId = nodeIds.get('cloud');
        const onpremiseId = nodeIds.get('onpremise');
        if (cloudId && onpremiseId) {
            commands.push(`connect,${cloudId},${onpremiseId},ethernet`);
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
        meterNodes.forEach(nodeId => {
            const meterType = nodeId.split('-')[0];
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
        return {
            generatedAt: new Date().toISOString(),
            version: '1.0',
            diagramType: 'energy-monitoring',
            nodeCount: energyMonitoringData.length + 2, // +2 for cloud and onpremise
            meterTypes: [...new Set(energyMonitoringData.map(m => m.monitoringDeviceType))],
            projectId: projectData.projectId,
            projectName: projectData.projectName,
            generator: 'EnergyDiagramGenerator'
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

    /**
     * Generate sample data for testing
     */
    generateSampleData() {
        return [
            {
                _id: '1',
                label: 'Main Smart Meter',
                panel: 'Panel A',
                monitoringDeviceType: 'smart-meter',
                description: 'Primary energy monitoring device',
                connection: 'wireless',
                status: 'active'
            },
            {
                _id: '2',
                label: 'Secondary General Meter',
                panel: 'Panel B',
                monitoringDeviceType: 'general-meter',
                description: 'Secondary monitoring point',
                connection: 'rs485',
                status: 'active'
            },
            {
                _id: '3',
                label: 'Memory Meter Unit',
                panel: 'Panel C',
                monitoringDeviceType: 'memory-meter',
                description: 'Data logging meter',
                connection: 'rs485',
                status: 'active'
            }
        ];
    }
}

module.exports = EnergyDiagramGenerator; 