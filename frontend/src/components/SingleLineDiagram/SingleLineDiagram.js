import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Box, Paper, Typography, Snackbar, Alert, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PowerIcon from '@mui/icons-material/Power';
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
import UploadIcon from '@mui/icons-material/Upload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useParams } from 'react-router-dom';
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
import DiagramChatInterface from '../DiagramChatInterface';

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

const initialNodes = [
  {
    id: '2',
    type: 'transformer',
    data: { label: 'Transformer' },
    position: { x: 250, y: 125 },
  },
  {
    id: '3',
    type: 'load',
    data: { label: 'Load' },
    position: { x: 250, y: 225 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

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
  { type: 'onPremise', label: 'On-Premise', icon: <StorageIcon /> },
  { type: 'wireless', label: 'Wireless', icon: <WifiIcon /> },
  { type: 'rs485', label: 'RS485', icon: <SettingsInputComponentIcon /> },
  { type: 'ethernet', label: 'Ethernet', icon: <RouterIcon /> },
];

const SingleLineDiagramInner = () => {
  const { id: projectId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const fileInputRef = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHandles, setShowHandles] = useState(false);
  const { getNodes, setNodes: setFlowNodes, getEdges, setEdges: setFlowEdges } = useReactFlow();

  // Memoize the nodeTypes to prevent recreation
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // Load diagram when component mounts or projectId changes
  useEffect(() => {
    const loadDiagram = async () => {
      if (!projectId) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }

        const response = await axios.get(`/api/projects/${projectId}/diagram`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.data) {
          setNodes(response.data.data.nodes || []);
          setEdges(response.data.data.edges || []);
          if (reactFlowInstance) {
            reactFlowInstance.fitView();
          }
        }
      } catch (error) {
        console.error('Error loading diagram:', error);
        // If it's a 404, it means no diagram exists yet - that's okay
        if (error.response?.status !== 404) {
          setSnackbar({
            open: true,
            message: error.response?.data?.error || error.message || 'Error loading diagram',
            severity: 'error'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDiagram();
  }, [projectId, reactFlowInstance]);

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

  const onExport = useCallback(() => {
    if (reactFlowInstance) {
      const flow = {
        nodes: nodes.map(node => ({
          ...node,
          position: node.position,
          data: { ...node.data }
        })),
        edges: edges.map(edge => ({
          ...edge,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          style: edge.style,
          animated: edge.animated,
          markerEnd: edge.markerEnd
        }))
      };

      const jsonString = JSON.stringify(flow, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'single-line-diagram.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [nodes, edges, reactFlowInstance]);

  const onImport = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target.result);
          if (flow.nodes && flow.edges) {
            setNodes(flow.nodes);
            setEdges(flow.edges);
            if (reactFlowInstance) {
              reactFlowInstance.fitView();
            }
          }
        } catch (error) {
          console.error('Error importing diagram:', error);
          setSnackbar({
            open: true,
            message: 'Error importing diagram. Please make sure the file is valid.',
            severity: 'error'
          });
        }
      };
      reader.readAsText(file);
    }
    // Reset the file input
    event.target.value = '';
  }, [setNodes, setEdges, reactFlowInstance]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onSave = useCallback(async () => {
    if (!projectId) {
      setSnackbar({
        open: true,
        message: 'No project ID found. Please save from within a project.',
        severity: 'error'
      });
      return;
    }

    setIsSaving(true);
    try {
      const flow = {
        nodes: nodes.map(node => ({
          ...node,
          position: node.position,
          data: { ...node.data }
        })),
        edges: edges.map(edge => ({
          ...edge,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          style: edge.style,
          animated: edge.animated,
          markerEnd: edge.markerEnd
        }))
      };

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await axios.post(
        `/api/projects/${projectId}/diagram`,
        flow,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Diagram saved successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || error.message || 'Error saving diagram',
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, projectId]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDiagramGenerated = useCallback((diagramData) => {
    setNodes(diagramData.nodes || []);
    setEdges(diagramData.edges || []);
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
    }
  }, [reactFlowInstance]);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: 'calc(100vh - 64px)', // Adjust based on your header height
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Left side - Diagram */}
      <Box sx={{ 
        flex: 1,
        height: '100%',
        position: 'relative',
        borderRight: '1px solid #e0e0e0'
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
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 1 }}>
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
                variant="contained"
                size="small"
                onClick={onSave}
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{ textTransform: 'none' }}
              >
                {isSaving ? 'Saving...' : 'Save Diagram'}
              </Button>
            </Box>
          </Panel>
        </ReactFlow>
      </Box>

      {/* Right side - Chat */}
      <Box sx={{ 
        width: '400px',
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#f5f5f5',
        p: 2
      }}>
        <DiagramChatInterface onDiagramGenerated={handleDiagramGenerated} />
      </Box>
    </Box>
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