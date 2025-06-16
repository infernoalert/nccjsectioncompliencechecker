import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TransformIcon from '@mui/icons-material/Transform';
import CableIcon from '@mui/icons-material/Cable';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import WifiIcon from '@mui/icons-material/Wifi';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import RouterIcon from '@mui/icons-material/Router';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  TransformerNode, 
  LoadNode,
  MeterNode,
  MeterMemoryNode,
  SmartMeterNode,
  AuthorityMeterNode,
  CloudNode,
  OnPremiseNode,
  WirelessNode,
  RS485Node,
  EthernetNode,
  TextNodeComponent,
  LabelNode
} from './CustomNodes';

import CircularProgress from '@mui/material/CircularProgress';
import { Backdrop, Typography } from '@mui/material';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.payamamerian.com' 
  : 'http://localhost:5000';

// Move nodeTypes outside of component and memoize it
const nodeTypes = {
  transformer: TransformerNode,
  load: LoadNode,
  meter: MeterNode,
  meterMemory: MeterMemoryNode,
  smartMeter: SmartMeterNode,
  authorityMeter: AuthorityMeterNode,
  cloud: CloudNode,
  onPremise: OnPremiseNode,
  wireless: WirelessNode,
  rs485: RS485Node,
  ethernet: EthernetNode,
  text: TextNodeComponent,
  label: LabelNode
};

const componentTypes = [
  { type: 'text', label: 'Text Note', icon: <EditIcon /> },
  { type: 'transformer', label: 'Transformer', icon: <TransformIcon /> },
  { type: 'load', label: 'Load', icon: <LightbulbIcon /> },
  { type: 'switch', label: 'Switch', icon: <ElectricBoltIcon /> },
  { type: 'cable', label: 'Cable', icon: <CableIcon /> },
  { type: 'meter', label: 'Meter', icon: <SpeedIcon /> },
  { type: 'meterMemory', label: 'Meter/Memory', icon: <MemoryIcon /> },
  { type: 'smartMeter', label: 'Smart Meter', icon: <SmartToyIcon /> },
  { type: 'authorityMeter', label: 'Authority Meter', icon: <VerifiedUserIcon /> },
  { type: 'cloud', label: 'Cloud', icon: <CloudIcon /> },
  { type: 'onPremise', label: 'onpremise', icon: <StorageIcon /> },
  { type: 'wireless', label: 'Wireless', icon: <WifiIcon /> },
  { type: 'rs485', label: 'RS485', icon: <SettingsInputComponentIcon /> },
  { type: 'ethernet', label: 'Ethernet', icon: <RouterIcon /> },
];

const SingleLineDiagramInner = () => {
  const { id } = useParams();
  const location = useLocation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showHandles, setShowHandles] = useState(false);
  const { getNodes, setNodes: setFlowNodes, getEdges, setEdges: setFlowEdges } = useReactFlow();
  const [showAssistantPanel, setShowAssistantPanel] = useState(true);

  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoGenMessage, setAutoGenMessage] = useState('');

  // Ref to track if auto-generation has already started (prevents duplicate execution)
  const hasAutoGenStarted = useRef(false);

  // Check if auto-generation should be disabled
  const searchParams = new URLSearchParams(location.search);
  const noAutoGen = searchParams.get('noAutoGen') === 'true';

  // Memoize the nodeTypes to prevent recreation
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // Load diagram when component mounts or projectId changes
  useEffect(() => {
    const loadDiagram = async () => {
      if (!id) return;
      
      console.log('📊 [LOAD-DIAGRAM] Attempting to load existing diagram...', { id });
      
      try {
        const response = await axios.get(`${API_URL}/api/projects/${id}/diagram`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache', // Prevent 304 responses
            'Pragma': 'no-cache'
          }
        });
        
        console.log('📊 [LOAD-DIAGRAM] Response received:', { 
          status: response.status,
          hasData: !!response.data,
          nodeCount: response.data?.nodes?.length || 0,
          edgeCount: response.data?.edges?.length || 0
        });
        
        if (response.data && (response.data.nodes?.length > 0 || response.data.edges?.length > 0)) {
          console.log('✅ [LOAD-DIAGRAM] Found existing diagram, loading it...');
          setNodes(response.data.nodes || []);
          setEdges(response.data.edges || []);
          if (reactFlowInstance) {
            reactFlowInstance.fitView();
          }
        } else {
          console.log('🔍 [LOAD-DIAGRAM] No existing diagram found, auto-generation will proceed');
        }
      } catch (error) {
        console.log('❌ [LOAD-DIAGRAM] Error loading diagram:', error);
        if (error.response?.status === 304) {
          console.log('📊 [LOAD-DIAGRAM] Received 304 (Not Modified) - diagram unchanged');
        } else if (error.response?.status === 404) {
          console.log('🔍 [LOAD-DIAGRAM] No existing diagram found (404), auto-generation will proceed');
        } else {
          console.error('❌ [LOAD-DIAGRAM] Unexpected error:', error);
        }
      }
    };
    loadDiagram();
  }, [id, reactFlowInstance, setNodes, setEdges]);

  // Auto-generation effect - runs once after component mount
  useEffect(() => {
    // Skip auto-generation if disabled by query parameter
    if (noAutoGen) {
      console.log('⚠️ [AUTO-GEN] Auto-generation disabled by noAutoGen parameter');
      return;
    }

    // Only run auto-generation if we haven't already started
    if (hasAutoGenStarted.current) {
      console.log('⚠️ [AUTO-GEN] Auto-generation already started, skipping duplicate execution');
      return;
    }

    const autoGenerateDiagram = async () => {
      console.log('🔍 [AUTO-GEN] useEffect triggered', { 
        id, 
        nodesLength: nodes.length,
        isAutoGenerating,
        hasAutoGenStarted: hasAutoGenStarted.current,
        noAutoGen,
        timestamp: new Date().toISOString()
      });
      
      if (!id) {
        console.log('❌ [AUTO-GEN] No project ID found, skipping auto-generation');
        return;
      }
      
      if (nodes.length > 0) {
        console.log('❌ [AUTO-GEN] Nodes already exist, skipping auto-generation', { nodesCount: nodes.length });
        return;
      }
      
      if (isAutoGenerating) {
        console.log('⚠️ [AUTO-GEN] Already generating, skipping duplicate request');
        return;
      }
      
      // Mark that we've started auto-generation
      hasAutoGenStarted.current = true;
      
      console.log('✅ [AUTO-GEN] Starting auto-generation process...');
      setIsAutoGenerating(true);
      setAutoGenMessage('Preparing to generate energy diagram...');
      
      // Add a longer delay to ensure loadDiagram completes first
      const timer = setTimeout(async () => {
        // Add a timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          console.error('⏰ [AUTO-GEN] TIMEOUT: Auto-generation took too long (30 seconds)');
          setAutoGenMessage('Auto-generation timed out. Please try using the manual button below.');
          setTimeout(() => {
            setIsAutoGenerating(false);
            setAutoGenMessage('');
          }, 3000);
        }, 30000); // 30 second timeout

        try {
          // Double-check that we still need to auto-generate
          console.log('🔍 [AUTO-GEN] Double-checking if auto-generation is still needed...', {
            currentNodesLength: nodes.length
          });
          
          if (nodes.length > 0) {
            console.log('⏭️ [AUTO-GEN] Nodes were loaded by loadDiagram, canceling auto-generation');
            setIsAutoGenerating(false);
            setAutoGenMessage('');
            clearTimeout(timeoutId);
            return;
          }
          
          console.log('🚀 [AUTO-GEN] Proceeding with auto-generation...');
          setAutoGenMessage('Fetching energy monitoring data...');
          
          // Call the function and wait for it to complete
          await handleAiDraw(true);
          
          console.log('✅ [AUTO-GEN] handleAiDraw completed successfully');
          clearTimeout(timeoutId); // Clear timeout on success
        } catch (error) {
          console.error('❌ [AUTO-GEN] Auto-generation failed:', error);
          console.error('❌ [AUTO-GEN] Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
          });
          
          clearTimeout(timeoutId); // Clear timeout on error
          setAutoGenMessage('Auto-generation failed. You can manually generate using the button below.');
          setTimeout(() => {
            console.log('🔄 [AUTO-GEN] Resetting auto-generation state after error');
            setIsAutoGenerating(false);
            setAutoGenMessage('');
          }, 3000);
        }
      }, 2000); // Increased delay to allow loadDiagram to complete

      return () => {
        console.log('🧹 [AUTO-GEN] Cleanup function called');
        clearTimeout(timer);
      };
    };

    autoGenerateDiagram();
  }, [id]); // Only depend on id to avoid infinite loops

  const onConnect = useCallback(
    (params) => {
      // Find source and target node positions
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      let edgeType = 'step';
      if (sourceNode && targetNode) {
        // Check if handles are aligned horizontally or vertically (rounded for grid tolerance)
        const sx = Math.round(sourceNode.position.x);
        const sy = Math.round(sourceNode.position.y);
        const tx = Math.round(targetNode.position.x);
        const ty = Math.round(targetNode.position.y);
        if (sx === tx || sy === ty) {
          edgeType = 'straight';
        }
      }

      const newEdge = {
        id: `e${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: edgeType,
        style: { stroke: '#000', strokeWidth: 2 },
        animated: false,
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
        },
      };

      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges, nodes]
  );

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedElements([...nodes, ...edges]);
  }, []);

  const onDelete = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !selectedElements.find((el) => el.id === node.id)));
    setEdges((eds) => eds.filter((edge) => !selectedElements.find((el) => el.id === edge.id)));
    setSelectedElements([]);
  }, [selectedElements, setNodes, setEdges]);

  const onKeyDown = useCallback(
    (event) => {
      if (
        event.key === 'Delete' || event.key === 'Backspace'
      ) {
        const tag = event.target.tagName;
        const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable;
        if (!isInput) {
          onDelete();
        }
      } else if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z') {
          event.preventDefault();
          const currentNodes = getNodes();
          const currentEdges = getEdges();
          if (currentNodes.length > 0 || currentEdges.length > 0) {
            setFlowNodes([]);
            setFlowEdges([]);
          }
        } else if (event.key === 'a') {
          event.preventDefault();
          setSelectedElements([...nodes, ...edges]);
        }
      }
    },
    [onDelete, getNodes, getEdges, setFlowNodes, setFlowEdges, nodes, edges, setSelectedElements]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: { 
          label: componentTypes.find(comp => comp.type === type).label,
          showHandles: showHandles 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes, showHandles]
  );

  // Update existing nodes when showHandles changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          showHandles: showHandles,
        },
      }))
    );
  }, [showHandles, setNodes]);

  const onSave = async () => {
    if (!id) {
      // setSnackbar({
      //   open: true,
      //   message: 'No project ID found. Please save from within a project.',
      //   severity: 'error'
      // });
      return;
    }

    setIsSaving(true);
    try {
      await axios.post(`${API_URL}/api/projects/${id}/diagram`, {
        nodes,
        edges
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      // setSnackbar({
      //   open: true,
      //   message: 'Diagram saved successfully!',
      //   severity: 'success'
      // });
    } catch (error) {
      console.error('Error saving diagram:', error);
      // setSnackbar({
      //   open: true,
      //   message: error.response?.data?.error || error.message || 'Error saving diagram',
      //   severity: 'error'
      // });
    } finally {
      setIsSaving(false);
    }
  };

  // Removed unused handleDiagramGenerated and handleStepChange functions

  // Handle AI Draw button click
  const handleAiDraw = async (isAutoGen = false) => {
    console.log('🎯 [HANDLE-AI-DRAW] Function called', {
      projectId: id,
      isSaving,
      isAutoGenerating,
      isAutoGen,
      timestamp: new Date().toISOString()
    });
    
    setIsSaving(true); // Reuse the saving state for loading indicator
    
    try {
      console.log('📡 [HANDLE-AI-DRAW] Preparing API call...');
      console.log('📡 [HANDLE-AI-DRAW] API URL:', `${API_URL}/api/projects/${id}/energy-diagram/generate`);
      console.log('📡 [HANDLE-AI-DRAW] Token exists:', !!localStorage.getItem('token'));
      
      // Call the energy diagram generate API
      console.log('📡 [HANDLE-AI-DRAW] Making API request...');
      const response = await axios.post(`${API_URL}/api/projects/${id}/energy-diagram/generate`, {
        saveToFile: false
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // Force fresh request to avoid 304
          'Pragma': 'no-cache'
        }
      });
      
      console.log('📡 [HANDLE-AI-DRAW] API Response received:', {
        status: response.status,
        success: response.data?.success,
        commandsLength: response.data?.commands?.length,
        hasMetadata: !!response.data?.metadata
      });

      if (response.data.success) {
        console.log('✅ [HANDLE-AI-DRAW] API call successful, processing commands...');
        const { commands, metadata } = response.data;
        
        console.log('🔧 [HANDLE-AI-DRAW] Command processing started:', {
          totalCommands: commands?.length || 0,
          metadata: metadata
        });

        // Sequential processing with delays - Process node by node
        const processCommandsSequentially = async () => {
          const nodeIdMapping = {}; // Track node IDs for connections
          let nodeCounter = 1;
          let edgeCounter = 1;
          let currentNodes = [];
          let currentEdges = [];

          // Helper function to update progress message
          const updateProgress = (message) => {
            if (isAutoGen) {
              setAutoGenMessage(message);
            }
          };

          // Step 0: Clear/Delete all existing nodes and edges first
          console.log('🧹 [HANDLE-AI-DRAW] Phase 0: Clearing existing diagram...');
          updateProgress('Clearing existing diagram...');
          
          // Clear all existing nodes and edges
          setNodes([]);
          setEdges([]);
          currentNodes = [];
          currentEdges = [];
          
          console.log('✅ [HANDLE-AI-DRAW] Phase 0 completed. Diagram cleared');
          
          // Small delay to ensure clearing is complete
          await new Promise(resolve => setTimeout(resolve, 300));

          // Step 1: Process ADD commands one by one
          console.log('🔧 [HANDLE-AI-DRAW] Phase 1: Adding nodes sequentially...');
          updateProgress('Creating infrastructure and devices...');
          
          let addCommandCount = 0;
          for (const cmd of commands) {
            const parts = cmd.split(',').map(part => part.trim());
            const commandType = parts[0]; // Renamed to avoid confusion
            
            if (commandType === 'add') {
              addCommandCount++;
              console.log(`➕ [HANDLE-AI-DRAW] Adding node ${addCommandCount}:`, cmd);
              updateProgress(`Adding node ${addCommandCount}...`);
              
              const [, nodeType, xRaw, yRaw] = parts; // Skip first element since we already have it
              const x = parseInt(xRaw, 10);
              const y = parseInt(yRaw, 10);
              
              // Convert grid coordinates to pixel positions (much closer spacing)
              const position = {
                x: 50 + x * 20,  // Much smaller spacing - reduced from 150 to 80
                y: 50 + y * 20   // Much smaller spacing - reduced from 100 to 60
              };

              console.log(`📍 [HANDLE-AI-DRAW] Node positioning:`, {
                nodeType,
                gridCoords: { x, y },
                pixelPosition: position
              });

              // Map backend node types to frontend node types
              const nodeTypeMapping = {
                'cloud': 'cloud',
                'onpremise': 'onPremise',
                'smart-meter': 'smartMeter',
                'general-meter': 'meter',
                'memory-meter': 'meterMemory',
                'auth-meter': 'authorityMeter',
                'transformer': 'transformer',
                'load': 'load'
              };

              const frontendNodeType = nodeTypeMapping[nodeType] || nodeType;
              const nodeId = `${nodeType}-${nodeCounter}`;
              const displayLabel = nodeType.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
              
              const newNode = {
                id: nodeId,
                type: frontendNodeType,
                position,
                data: { 
                  label: displayLabel,
                  showHandles: showHandles,
                  nodeType: nodeType
                },
                width: 120,
                height: 90
              };

              currentNodes.push(newNode);
              nodeIdMapping[`${nodeType}-${nodeCounter}`] = nodeId;
              nodeCounter++;

              // Update React state with new node
              setNodes([...currentNodes]);
              
              // Small delay to allow React to render
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }

          console.log(`✅ [HANDLE-AI-DRAW] Phase 1 completed. Added ${currentNodes.length} nodes`);

          // Step 2: Process SET-PROPERTY commands
          console.log('🔧 [HANDLE-AI-DRAW] Phase 2: Setting properties...');
          updateProgress('Configuring node properties...');
          
          let propertyCommandCount = 0;
          for (const cmd of commands) {
            const parts = cmd.split(',').map(part => part.trim());
            const commandType = parts[0]; // Renamed to avoid confusion
            
            if (commandType === 'set-property') {
              propertyCommandCount++;
              console.log(`🏷️ [HANDLE-AI-DRAW] Setting property ${propertyCommandCount}:`, cmd);
              
              const [, nodeId, property, value] = parts; // Skip first element since we already have it
              const nodeIndex = currentNodes.findIndex(n => n.id === nodeId || nodeIdMapping[nodeId] === n.id);
              
              if (nodeIndex !== -1) {
                const updatedNodes = [...currentNodes];
                if (property === 'label') {
                  updatedNodes[nodeIndex] = {
                    ...updatedNodes[nodeIndex],
                    data: { ...updatedNodes[nodeIndex].data, label: value }
                  };
                } else if (property === 'panel') {
                  updatedNodes[nodeIndex] = {
                    ...updatedNodes[nodeIndex],
                    data: { ...updatedNodes[nodeIndex].data, panel: value }
                  };
                } else if (property === 'description') {
                  updatedNodes[nodeIndex] = {
                    ...updatedNodes[nodeIndex],
                    data: { ...updatedNodes[nodeIndex].data, description: value }
                  };
                } else {
                  updatedNodes[nodeIndex] = {
                    ...updatedNodes[nodeIndex],
                    data: { ...updatedNodes[nodeIndex].data, [property]: value }
                  };
                }
                
                currentNodes = updatedNodes;
                setNodes(updatedNodes);
                
                // Small delay
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }
          }

          console.log(`✅ [HANDLE-AI-DRAW] Phase 2 completed. Processed ${propertyCommandCount} properties`);

          // Step 3: Process CONNECT commands one by one
          console.log('🔧 [HANDLE-AI-DRAW] Phase 3: Creating connections...');
          updateProgress('Connecting devices...');
          
          let connectCommandCount = 0;
          for (const cmd of commands) {
            const parts = cmd.split(',').map(part => part.trim());
            const commandType = parts[0]; // Renamed to avoid confusion
            
            if (commandType === 'connect') {
              connectCommandCount++;
              console.log(`🔗 [HANDLE-AI-DRAW] Creating connection ${connectCommandCount}:`, cmd);
              updateProgress(`Creating connection ${connectCommandCount}...`);
              
              const [, sourceId, targetId, connectionType] = parts; // Skip first element since we already have it
              const sourceNodeId = nodeIdMapping[sourceId] || sourceId;
              const targetNodeId = nodeIdMapping[targetId] || targetId;
              
              if (sourceNodeId && targetNodeId) {
                const edgeStyle = {
                  stroke: connectionType === 'wireless' ? '#2196F3' : 
                          connectionType === 'ethernet' ? '#4CAF50' : 
                          connectionType === 'rs485' ? '#FF9800' : '#000',
                  strokeWidth: 2,
                  strokeDasharray: connectionType === 'wireless' ? '5,5' : undefined
                };

                const newEdge = {
                  id: `edge-${edgeCounter++}`,
                  source: sourceNodeId,
                  target: targetNodeId,
                  type: 'step',
                  style: edgeStyle,
                  animated: connectionType === 'wireless',
                  label: connectionType,
                  labelStyle: { 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    fill: edgeStyle.stroke 
                  },
                  markerEnd: {
                    type: 'arrowclosed',
                    width: 20,
                    height: 20,
                    color: edgeStyle.stroke
                  }
                };

                currentEdges.push(newEdge);
                setEdges([...currentEdges]);
                
                // Delay for visual effect
                await new Promise(resolve => setTimeout(resolve, 300));
              }
            }
          }

          console.log(`✅ [HANDLE-AI-DRAW] Phase 3 completed. Created ${currentEdges.length} connections`);

          // Step 4: Apply styling
          console.log('🔧 [HANDLE-AI-DRAW] Phase 4: Applying styling...');
          updateProgress('Applying visual styles...');
          
          let styleCommandCount = 0;
          for (const cmd of commands) {
            const parts = cmd.split(',').map(part => part.trim());
            const commandType = parts[0]; // Renamed to avoid confusion
            
            if (commandType === 'style') {
              styleCommandCount++;
              console.log(`🎨 [HANDLE-AI-DRAW] Applying style ${styleCommandCount}:`, cmd);
              
              const [, nodeId, property, value] = parts; // Skip first element since we already have it
              const nodeIndex = currentNodes.findIndex(n => n.id === nodeId || nodeIdMapping[nodeId] === n.id);
              
              if (nodeIndex !== -1) {
                const updatedNodes = [...currentNodes];
                if (!updatedNodes[nodeIndex].style) updatedNodes[nodeIndex].style = {};
                
                if (property === 'color') {
                  updatedNodes[nodeIndex].style.backgroundColor = value;
                  updatedNodes[nodeIndex].style.border = `2px solid ${value}`;
                } else if (property === 'shape') {
                  updatedNodes[nodeIndex].data.shape = value;
                }
                
                currentNodes = updatedNodes;
                setNodes(updatedNodes);
                
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }
          }

          console.log(`✅ [HANDLE-AI-DRAW] Phase 4 completed. Applied ${styleCommandCount} styles`);
          
          return { nodes: currentNodes, edges: currentEdges };
        };

        // Execute sequential processing
        const result = await processCommandsSequentially();
        
        console.log('🔧 [HANDLE-AI-DRAW] All phases completed:', {
          totalNodes: result.nodes.length,
          totalEdges: result.edges.length
        });
        
        // Auto-fit the view to see all nodes
        setTimeout(() => {
          console.log('🔄 [HANDLE-AI-DRAW] Auto-fitting view to see all nodes');
          if (reactFlowInstance) {
            console.log('✅ [HANDLE-AI-DRAW] Calling fitView with padding');
            reactFlowInstance.fitView({ padding: 0.15, duration: 800 });
          } else {
            console.log('⚠️ [HANDLE-AI-DRAW] ReactFlow instance not available for fitView');
          }
        }, 500); // Increased from 100ms to 500ms

        console.log('✅ AI Draw completed successfully', {
          nodesCreated: result.nodes.length,
          edgesCreated: result.edges.length,
          metadata: metadata
        });

        // Handle auto-generation success
        console.log('🎉 [HANDLE-AI-DRAW] Generation completed successfully!', {
          isAutoGen,
          nodesCreated: result.nodes.length,
          edgesCreated: result.edges.length,
          metadata: metadata
        });
        
        if (isAutoGen) {
          console.log('✅ [HANDLE-AI-DRAW] Auto-generation success - updating UI messages');
          setAutoGenMessage('✅ Energy diagram generated successfully!');
          setTimeout(() => {
            console.log('🔄 [HANDLE-AI-DRAW] Resetting auto-generation state after success');
            setIsAutoGenerating(false);
            setAutoGenMessage('');
          }, 2000);
        } else {
          console.log('✅ [HANDLE-AI-DRAW] Manual generation success - showing alert');
          // Show success notification for manual generation
          const deviceCount = metadata?.deviceCount || result.nodes.length - 2; // Subtract infrastructure nodes
          alert(`✅ Energy diagram generated successfully!\n\nCreated:\n• ${result.nodes.length} nodes\n• ${result.edges.length} connections\n• ${deviceCount} energy monitoring devices`);
        }

      } else {
        console.log('❌ [HANDLE-AI-DRAW] API returned unsuccessful response:', response.data);
        throw new Error(response.data.error || 'Failed to generate diagram');
      }
    } catch (error) {
      console.error('❌ [HANDLE-AI-DRAW] Error in handleAiDraw function:', error);
      console.error('❌ [HANDLE-AI-DRAW] Full error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        stack: error.stack
      });
      
      let errorMessage = 'Error generating diagram';
      if (error.response?.status === 400) {
        errorMessage = error.response.data.error || 'No energy monitoring devices found for this project';
      } else if (error.response?.status === 404) {
        errorMessage = 'Project not found';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else {
        errorMessage = error.response?.data?.error || error.message;
      }
      
      console.log('🚨 [HANDLE-AI-DRAW] Showing error to user:', errorMessage);
      alert(`❌ ${errorMessage}`);
    } finally {
      console.log('🔄 [HANDLE-AI-DRAW] Finally block - resetting states');
      setIsSaving(false);
      
      // Also reset auto-generation state if it was an auto-generation
      if (isAutoGen) {
        console.log('🔄 [HANDLE-AI-DRAW] Resetting auto-generation state in finally block');
        setIsAutoGenerating(false);
        setAutoGenMessage('');
      }
      
      console.log('✅ [HANDLE-AI-DRAW] handleAiDraw function completed');
    }
  };

  return (
    <>
      {/* Auto-generation Loading Backdrop */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
        open={isAutoGenerating}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" component="div" sx={{ mt: 2 }}>
          Automatically Generating Energy Diagram
        </Typography>
        <Typography variant="body1" component="div" sx={{ textAlign: 'center', maxWidth: 400 }}>
          {autoGenMessage}
        </Typography>
        <Typography variant="body2" component="div" sx={{ textAlign: 'center', opacity: 0.8 }}>
          This may take a few moments...
        </Typography>
      </Backdrop>

      <Box sx={{ 
        display: 'flex', 
        height: 'calc(100vh - 64px)', // Adjust based on your header height
        width: '100%',
        overflow: 'hidden'
      }}>
      {/* Left side - Diagram */}
      <Box sx={{ 
        flex: showAssistantPanel ? 1 : '1 1 100%',
        height: '100%',
        position: 'relative',
        borderRight: showAssistantPanel ? '1px solid #e0e0e0' : 'none',
        transition: 'flex 0.3s',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onKeyDown={onKeyDown}
          nodeTypes={memoizedNodeTypes}
          fitView
          attributionPosition="bottom-left"
          connectionMode="loose"
          snapToGrid={true}
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            type: 'step',
            style: { stroke: '#000', strokeWidth: 2 },
            animated: false,
            markerEnd: {
              type: 'arrowclosed',
              width: 20,
              height: 20,
            },
          }}
        >
          <Controls />
          <MiniMap />
          <Background />
          <Panel position="top-left">
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                rowGap: 1.5,
                p: 1,
                justifyContent: { xs: 'center', sm: 'flex-start' },
                maxWidth: { xs: '100vw', sm: 900, md: 1200 },
                overflowX: 'auto',
              }}
            >
              {componentTypes.map((component) => (
                <Button
                  key={component.type}
                  variant="outlined"
                  size="small"
                  startIcon={component.icon}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', component.type);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  draggable
                  sx={{
                    textTransform: 'none',
                    minWidth: { xs: 80, sm: 120 },
                    px: { xs: 1, sm: 2 },
                    fontSize: { xs: '0.75rem', sm: '0.9rem' },
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  {component.label}
                </Button>
              ))}
            </Box>
          </Panel>
          <Panel position="top-right">
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Removed Show Handles from here */}
            </Box>
          </Panel>
        </ReactFlow>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            p: 2,
            position: 'absolute',
            bottom: 0,
            left: 0,
            zIndex: 10,
            background: 'rgba(255,255,255,0.85)',
            borderTop: '1px solid #e0e0e0'
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={onDelete}
            disabled={selectedElements.length === 0}
            startIcon={<DeleteIcon />}
            sx={{ textTransform: 'none' }}
          >
            Delete Selected
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowHandles(!showHandles)}
            startIcon={showHandles ? <VisibilityOffIcon /> : <VisibilityIcon />}
            sx={{ textTransform: 'none' }}
          >
            {showHandles ? 'Hide Handles' : 'Show Handles'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ textTransform: 'none' }}
          >
            {isSaving ? 'Saving...' : 'Save Diagram'}
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => handleAiDraw(false)}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SmartToyIcon />}
            sx={{
              backgroundColor: '#2E7D32', // Green color for energy theme
              color: 'white',
              '&:hover': {
                backgroundColor: '#1B5E20', // Darker green on hover
              },
              '&:disabled': {
                backgroundColor: '#A5D6A7',
                color: 'white'
              },
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              padding: '10px 24px',
              borderRadius: '8px',
              textTransform: 'none',
              ml: 2, // margin-left for spacing
              transition: 'all 0.3s ease'
            }}
          >
            {isSaving ? 'Generating Energy Diagram...' : '⚡ Generate Energy Diagram'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowAssistantPanel((prev) => !prev)}
            startIcon={showAssistantPanel ? <MenuOpenIcon /> : <MenuIcon />}
            sx={{ textTransform: 'none' }}
          >
            {showAssistantPanel ? 'Hide Assistant' : 'Show Assistant'}
          </Button>
        </Box>
      </Box>

      {/* Right side - Chat */}
      {/* 
        Diagram Chat Assistant section has been disabled as per requirements.
        This section previously contained the AI-powered chat interface for diagram generation.
        The functionality has been preserved in the code but is currently not in use.
      */}
      {/* {showAssistantPanel && (
        <Box
          sx={{
            width: { xs: '100vw', sm: 650, md: 700 },
            minWidth: 400,
            maxWidth: 900,
            height: '100%',
            overflowY: 'auto',
            backgroundColor: '#f5f5f5',
            p: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            boxSizing: 'border-box'
          }}
        >
          <DiagramChatInterface 
            onDiagramGenerated={handleDiagramGenerated} 
            onStepChange={handleStepChange}
            currentStep={currentStep}
          />
        </Box>
      )} */}
      </Box>
    </>
  );
};

const SingleLineDiagram = () => {
  return (
    <ReactFlowProvider>
      <SingleLineDiagramInner />
    </ReactFlowProvider>
  );
};

export default SingleLineDiagram; 