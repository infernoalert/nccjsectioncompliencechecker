import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
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
  TextNodeComponent
} from './CustomNodes';

// Custom node types
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

const SingleLineDiagram = () => {
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
      // Check if the connection is valid (not connecting to the same handle)
      if (params.source === params.target) {
        return;
      }

      // Check if there's already a connection between these exact handles
      const existingConnection = edges.find(
        edge => 
          edge.source === params.source && 
          edge.target === params.target &&
          edge.sourceHandle === params.sourceHandle &&
          edge.targetHandle === params.targetHandle
      );

      if (existingConnection) {
        return;
      }

      const newEdge = {
        ...params,
        type: 'step',
        style: { stroke: '#000', strokeWidth: 2 },
        animated: false,
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, edges]
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
      if (event.key === 'Delete' || event.key === 'Backspace') {
        onDelete();
      }
    },
    [onDelete]
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

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1000,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImport}
        accept=".json"
        style={{ display: 'none' }}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onKeyDown={onKeyDown}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
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
        connectionMode="strict"
        snapToGrid={true}
        snapGrid={[15, 15]}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
        <Panel position="top-right">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={onSave}
              disabled={isSaving || isLoading}
            >
              {isSaving ? 'Saving...' : 'Save to Project'}
            </Button>
            {/* <Button
              variant="contained"
              color="secondary"
              startIcon={<SaveIcon />}
              onClick={onExport}
              disabled={isLoading}
            >
              Export Diagram
            </Button> */}
            {/* <Button
              variant="contained"
              color="info"
              startIcon={<UploadIcon />}
              onClick={handleImportClick}
              disabled={isLoading}
            >
              Import Diagram
            </Button> */}
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDelete}
              disabled={selectedElements.length === 0 || isLoading}
            >
              Delete Selected
            </Button>
          </Box>
        </Panel>
        <Panel position="left" style={{ width: '200px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Components
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {componentTypes.map((component) => (
                <Button
                  key={component.type}
                  variant="outlined"
                  startIcon={component.icon}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', component.type);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {component.label}
                </Button>
              ))}
            </Box>
          </Paper>
        </Panel>
      </ReactFlow>
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          onClick={() => setShowHandles(!showHandles)}
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
          startIcon={showHandles ? <VisibilityOffIcon /> : <VisibilityIcon />}
        >
          {showHandles ? 'Hide Connection Points' : 'Show Connection Points'}
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SingleLineDiagram; 