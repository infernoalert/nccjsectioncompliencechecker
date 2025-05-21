import React, { useState, useCallback } from 'react';
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
import { Button, Box, Paper, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PowerIcon from '@mui/icons-material/Power';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TransformIcon from '@mui/icons-material/Transform';
import CableIcon from '@mui/icons-material/Cable';
import { PowerSourceNode, TransformerNode, LoadNode } from './CustomNodes';

// Custom node types
const nodeTypes = {
  powerSource: PowerSourceNode,
  transformer: TransformerNode,
  load: LoadNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'powerSource',
    data: { label: 'Power Source' },
    position: { x: 250, y: 25 },
  },
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
  { type: 'powerSource', label: 'Power Source', icon: <PowerIcon /> },
  { type: 'transformer', label: 'Transformer', icon: <TransformIcon /> },
  { type: 'load', label: 'Load', icon: <LightbulbIcon /> },
  { type: 'switch', label: 'Switch', icon: <ElectricBoltIcon /> },
  { type: 'cable', label: 'Cable', icon: <CableIcon /> },
];

const SingleLineDiagram = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedElements, setSelectedElements] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
        data: { label: componentTypes.find(comp => comp.type === type).label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes]
  );

  return (
    <div style={{ width: '100%', height: '100vh' }}>
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
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
        <Panel position="top-right">
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            disabled={selectedElements.length === 0}
            sx={{ mb: 1 }}
          >
            Delete Selected
          </Button>
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
    </div>
  );
};

export default SingleLineDiagram; 