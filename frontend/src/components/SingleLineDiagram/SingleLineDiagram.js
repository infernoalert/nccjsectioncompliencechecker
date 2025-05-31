import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';

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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showHandles, setShowHandles] = useState(false);
  const { getNodes, setNodes: setFlowNodes, getEdges, setEdges: setFlowEdges } = useReactFlow();
  const [showAssistantPanel, setShowAssistantPanel] = useState(true);
  const [currentStep, setCurrentStep] = useState('initial'); // Default to initial step

  // Memoize the nodeTypes to prevent recreation
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // Load diagram when component mounts or projectId/currentStep changes
  useEffect(() => {
    const loadDiagram = async () => {
      if (!id || !currentStep) return;
      try {
        const response = await axios.get(`${API_URL}/api/projects/${id}/steps/${currentStep}/diagram`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.data) {
          setNodes(response.data.nodes || []);
          setEdges(response.data.edges || []);
          if (reactFlowInstance) {
            reactFlowInstance.fitView();
          }
        }
      } catch (error) {
        console.error('Error loading diagram:', error);
        if (error.response?.status !== 404) {
          // setSnackbar({
          //   open: true,
          //   message: error.response?.data?.error || error.message || 'Error loading diagram',
          //   severity: 'error'
          // });
        }
      }
    };
    loadDiagram();
  }, [id, currentStep, reactFlowInstance, setNodes, setEdges]);

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
    if (!id || !currentStep) {
      // setSnackbar({
      //   open: true,
      //   message: 'No project ID or current step found. Please save from within a project.',
      //   severity: 'error'
      // });
      return;
    }

    setIsSaving(true);
    try {
      await axios.post(`${API_URL}/api/projects/${id}/steps/${currentStep}/diagram`, {
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

  const handleDiagramGenerated = useCallback((diagramData) => {
    setNodes(diagramData.nodes || []);
    setEdges(diagramData.edges || []);
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  const handleStepChange = useCallback((newStep) => {
    setCurrentStep(newStep);
  }, []);

  return (
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
            variant="contained"
            size="small"
            onClick={onSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ textTransform: 'none' }}
          >
            {isSaving ? 'Saving...' : 'Save Diagram'}
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
      {showAssistantPanel && (
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
      )}
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