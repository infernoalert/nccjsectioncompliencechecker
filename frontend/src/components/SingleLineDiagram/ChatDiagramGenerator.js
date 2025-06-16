import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert,
  IconButton,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Position } from 'reactflow';

// Command definitions
const COMMANDS = {
  ADD: 'add',
  DELETE: 'delete',
  DELETE_ALL: 'delete-all',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect'
};

// Node types mapping
const NODE_TYPES = {
  'smart-meter': 'smartMeter',
  'smartmeter': 'smartMeter',
  'meter': 'meter',
  'transformer': 'transformer',
  'load': 'load',
  'cloud': 'cloud',
  'wireless': 'wireless',
  'rs485': 'rs485',
  'ethernet': 'ethernet',  
  'onpremise': 'onPremise',  
  'authmeter': 'authorityMeter',  
  'metermemory': 'meterMemory',
  'label': 'label'
};

// Connection points mapping
const CONNECTION_POINTS = {
  'top': 'top',
  'right': 'right',
  'bottom': 'bottom',
  'left': 'left',
  't': 'top',
  'r': 'right',
  'b': 'bottom',
  'l': 'left'
};

// Grid configuration
const GRID_CONFIG = {
  cellSize: 150, // Increased from 150 to 165 (10% more) to create more space between nodes
  startX: 100,   // Starting X position
  startY: 100    // Starting Y position
};

const ChatDiagramGenerator = ({ onDiagramGenerated, isAdmin = false }) => {
  const { id: projectId } = useParams();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [testInput, setTestInput] = useState('');
  const [localDiagram, setLocalDiagram] = useState({ nodes: [], edges: [] });
  const chatEndRef = useRef(null);

  // --- New: AI Chat UI for non-admins ---
  const [chatInput, setChatInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([]); // {role: 'user'|'ai', content: string}
  const [aiLoading, setAiLoading] = useState(false);

  // --- AI Diagram Command Interface (for all users) ---
  const [aiRawResponse, setAiRawResponse] = useState('');

  // Remove AI command block output box. Only show input and send button for AI prompt.
  const [aiInput, setAiInput] = useState('');

  // Convert diagram state to commands
  const diagramToCommands = (diagram) => {
    const commands = [];
    
    // First add all nodes
    diagram.nodes.forEach(node => {
      const nodeType = Object.entries(NODE_TYPES).find(([key, value]) => value === node.type)?.[0];
      if (nodeType) {
        commands.push(`add,${nodeType},${node.position.x},${node.position.y}`);
      }
    });

    // Then add all connections
    diagram.edges.forEach(edge => {
      const sourceNode = diagram.nodes.find(n => n.id === edge.source);
      const targetNode = diagram.nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        commands.push(`connect,${sourceNode.position.x},${sourceNode.position.y},${edge.sourceHandle},${targetNode.position.x},${targetNode.position.y},${edge.targetHandle}`);
      }
    });

    return commands;
  };

  // Convert grid coordinates to pixel positions
  const calculatePosition = (x, y) => {
    return {
      x: GRID_CONFIG.startX + (parseInt(x) - 1) * GRID_CONFIG.cellSize,
      y: GRID_CONFIG.startY +100+ (parseInt(y) - 1) * GRID_CONFIG.cellSize
    };
  };

  // Convert commands to diagram state
  const commandsToDiagram = (commands, currentState) => {
    const newDiagram = { 
      nodes: [...currentState.nodes], 
      edges: [...currentState.edges] 
    };
    
    commands.forEach(cmd => {
      const parts = cmd.split(',').map(part => part.trim().toLowerCase());
      const command = parts[0];
      
      if (command === 'add') {
        const [_, nodeType, xRaw, yRaw, customLabelRaw] = parts;
        // Parse x and y as numbers and validate
        const x = parseInt(xRaw, 10);
        const y = parseInt(yRaw, 10);
        if (isNaN(x) || isNaN(y) || x < 1 || y < 1 || x > 100 || y > 100) {
          console.warn('Invalid x or y for add command:', { xRaw, yRaw, x, y });
          return;
        }
        // Clean up customLabel
        let customLabel = customLabelRaw;
        if (customLabel && typeof customLabel === 'string') {
          customLabel = customLabel.trim();
          if ((customLabel.startsWith('"') && customLabel.endsWith('"')) || (customLabel.startsWith("'") && customLabel.endsWith("'"))) {
            customLabel = customLabel.slice(1, -1);
          }
        }
        const type = NODE_TYPES[nodeType];
        if (type) {
          const nodeId = `${type}-${Date.now()}`;
          const position = calculatePosition(x, y);
          console.log('Adding node:', { type, x, y, position, customLabel });
          if (type === 'label') {
            newDiagram.nodes.push({
              id: nodeId,
              type: type,
              position,
              data: {
                label: customLabel || 'Label',
                showHandles: false
              },
              width: 100,
              height: 40
            });
          } else {
            // Use custom label if provided, otherwise use default label
            const label = customLabel ? customLabel : 
              nodeType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            newDiagram.nodes.push({
              id: nodeId,
              type: type,
              position,
              data: { 
                label,
                showHandles: false
              },
              width: 100,
              height: 87
            });
          }
        }
      } else if (command === 'connect') {
        const [_, x1, y1, point1, x2, y2, point2] = parts;
        const sourceNode = newDiagram.nodes.find(n => 
          n.position.x === calculatePosition(x1, y1).x && 
          n.position.y === calculatePosition(x1, y1).y
        );
        const targetNode = newDiagram.nodes.find(n => 
          n.position.x === calculatePosition(x2, y2).x && 
          n.position.y === calculatePosition(x2, y2).y
        );
        
        if (sourceNode && targetNode) {
          newDiagram.edges.push({
            id: `e${sourceNode.id}-${targetNode.id}-${Date.now()}`,
            source: sourceNode.id,
            target: targetNode.id,
            sourceHandle: point1,
            targetHandle: point2,
            type: 'step',
            style: { stroke: '#000', strokeWidth: 2 },
            animated: false,
            markerEnd: { type: 'arrowclosed', width: 20, height: 20 }
          });
        }
      } else if (command === 'delete') {
        const [_, x, y] = parts;
        const position = calculatePosition(x, y);
        const nodeToDelete = newDiagram.nodes.find(n => 
          n.position.x === position.x && 
          n.position.y === position.y
        );
        if (nodeToDelete) {
          newDiagram.nodes = newDiagram.nodes.filter(n => n.id !== nodeToDelete.id);
          newDiagram.edges = newDiagram.edges.filter(e => 
            e.source !== nodeToDelete.id && e.target !== nodeToDelete.id
          );
        }
      } else if (command === 'delete-all') {
        newDiagram.nodes = [];
        newDiagram.edges = [];
      }
    });

    return newDiagram;
  };

  const handleTestSubmit = async () => {
    if (!testInput.trim()) return;

    try {
      setChatHistory(prev => [...prev, { 
        type: 'user', 
        content: `[TEST] ${testInput}`
      }]);

      const commands = testInput
        .split(/[|{}\[\]]/)
        .map(cmd => cmd.trim())
        .filter(cmd => cmd);

      let currentDiagram = { ...localDiagram };
      
      for (const cmd of commands) {
        try {
          const parts = cmd.split(',').map(part => part.trim().toLowerCase());
          const command = parts[0];
          const args = parts.slice(1);

          validateCommand(command, args);
          
          // Update local diagram state using current state
          const newDiagram = commandsToDiagram([cmd], currentDiagram);
          currentDiagram = newDiagram;
          setLocalDiagram(newDiagram);
          
          // Update visual diagram
          onDiagramGenerated(newDiagram);

          setChatHistory(prev => [...prev, { 
            type: 'ai', 
            content: `Executed: ${cmd}`
          }]);

          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          const errorMessage = `Error in command "${cmd}": ${error.message}`;
          setChatHistory(prev => [...prev, { 
            type: 'error', 
            content: errorMessage
          }]);
          continue;
        }
      }

    } catch (error) {
      console.error('Command execution error:', error);
      setChatHistory(prev => [...prev, { 
        type: 'error', 
        content: error.message || 'Error executing commands'
      }]);
    } finally {
      setTestInput('');
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const validateCommand = (command, args) => {
    if (!Object.values(COMMANDS).includes(command)) {
      throw new Error(`Invalid command: ${command}. Available commands: ${Object.values(COMMANDS).join(', ')}`);
    }

    switch (command) {
      case COMMANDS.DELETE_ALL:
        if (args.length !== 0) {
          throw new Error('Delete-all command takes no arguments');
        }
        break;

      case COMMANDS.ADD:
        if (args.length < 3 || args.length > 4) {
          throw new Error(`Add command requires 3-4 arguments: nodeType,x,y[,label]. Received: ${args.join(',')}`);
        }
        if (!NODE_TYPES[args[0]]) {
          throw new Error(`Invalid node type: ${args[0]}. Available types: ${Object.keys(NODE_TYPES).join(', ')}`);
        }
        if (isNaN(args[1]) || isNaN(args[2])) {
          throw new Error('X and Y coordinates must be numbers');
        }
        break;

      case COMMANDS.DELETE:
        if (args.length !== 2) {
          throw new Error(`Delete command requires 2 arguments: x,y. Received: ${args.join(',')}`);
        }
        if (isNaN(args[0]) || isNaN(args[1])) {
          throw new Error('X and Y coordinates must be numbers');
        }
        break;

      case COMMANDS.CONNECT:
        if (args.length !== 6) {
          throw new Error(`Connect command requires 6 arguments: x1,y1,point1,x2,y2,point2. Received: ${args.join(',')}`);
        }
        if (args.slice(0, 2).some(arg => isNaN(arg)) || args.slice(3, 5).some(arg => isNaN(arg))) {
          throw new Error('Coordinates must be numbers');
        }
        if (!CONNECTION_POINTS[args[2]] || !CONNECTION_POINTS[args[5]]) {
          throw new Error(`Invalid connection point. Available points: ${Object.keys(CONNECTION_POINTS).join(', ')}`);
        }
        break;

      case COMMANDS.DISCONNECT:
        if (args.length !== 6) {
          throw new Error(`Disconnect command requires 6 arguments: x1,y1,point1,x2,y2,point2. Received: ${args.join(',')}`);
        }
        if (args.slice(0, 2).some(arg => isNaN(arg)) || args.slice(3, 5).some(arg => isNaN(arg))) {
          throw new Error('Coordinates must be numbers');
        }
        if (!CONNECTION_POINTS[args[2]] || !CONNECTION_POINTS[args[5]]) {
          throw new Error(`Invalid connection point. Available points: ${Object.keys(CONNECTION_POINTS).join(', ')}`);
        }
        break;
    }
  };

  const findNodeAtPosition = (nodes, x, y) => {
    const position = calculatePosition(x, y);
    return nodes.find(node => 
      Math.abs(node.position.x - position.x) < GRID_CONFIG.cellSize / 2 &&
      Math.abs(node.position.y - position.y) < GRID_CONFIG.cellSize / 2
    );
  };

  const findConnectionPoint = (node, point) => {
    const pointMap = {
      'top': { position: Position.Top, type: 'source' },
      'right': { position: Position.Right, type: 'source' },
      'bottom': { position: Position.Bottom, type: 'source' },
      'left': { position: Position.Left, type: 'source' }
    };
    return pointMap[point];
  };

  const executeCommand = async (command, args, currentNodes, currentEdges) => {
    let updatedNodes = [...currentNodes];
    let updatedEdges = [...currentEdges];
    let message = '';

    switch (command) {
      case COMMANDS.DELETE_ALL:
        updatedNodes = [];
        updatedEdges = [];
        message = 'Cleared all nodes and connections';
        break;

      case COMMANDS.ADD: {
        const [nodeType, x, y, customLabel] = args;
        const position = calculatePosition(parseInt(x), parseInt(y));
        const nodeId = `${NODE_TYPES[nodeType]}-${Date.now()}`;
        
        const newNode = {
          id: nodeId,
          type: NODE_TYPES[nodeType],
          position,
          data: { 
            label: customLabel ? customLabel : 
              nodeType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            showHandles: false
          }
        };

        updatedNodes = [...currentNodes, newNode];
        message = `Added ${nodeType} at position (${x}, ${y})`;
        break;
      }

      case COMMANDS.DELETE: {
        const [x, y] = args;
        const nodeToDelete = findNodeAtPosition(currentNodes, x, y);
        
        if (!nodeToDelete) {
          throw new Error(`No node found at position (${x}, ${y})`);
        }

        updatedNodes = currentNodes.filter(node => node.id !== nodeToDelete.id);
        // Also remove any edges connected to this node
        updatedEdges = currentEdges.filter(edge => 
          edge.source !== nodeToDelete.id && edge.target !== nodeToDelete.id
        );
        message = `Deleted node at position (${x}, ${y})`;
        break;
      }

      case COMMANDS.CONNECT: {
        const [x1, y1, point1, x2, y2, point2] = args;
        const node1 = findNodeAtPosition(currentNodes, x1, y1);
        const node2 = findNodeAtPosition(currentNodes, x2, y2);

        if (!node1 || !node2) {
          throw new Error('Both positions must contain nodes to connect');
        }

        const connection1 = findConnectionPoint(node1, CONNECTION_POINTS[point1]);
        const connection2 = findConnectionPoint(node2, CONNECTION_POINTS[point2]);

        if (!connection1 || !connection2) {
          throw new Error('Invalid connection points');
        }

        const newEdge = {
          id: `e${node1.id}-${node2.id}-${Date.now()}`,
          source: node1.id,
          target: node2.id,
          sourceHandle: point1,
          targetHandle: point2,
          type: 'step',
          style: { stroke: '#000', strokeWidth: 2 },
          animated: false,
          markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
          },
        };

        updatedEdges = [...currentEdges, newEdge];
        message = `Connected nodes at (${x1}, ${y1}) and (${x2}, ${y2})`;
        break;
      }

      case COMMANDS.DISCONNECT: {
        const [x1, y1, point1, x2, y2, point2] = args;
        const node1 = findNodeAtPosition(currentNodes, x1, y1);
        const node2 = findNodeAtPosition(currentNodes, x2, y2);

        if (!node1 || !node2) {
          throw new Error('Both positions must contain nodes to disconnect');
        }

        updatedEdges = currentEdges.filter(edge => 
          !(edge.source === node1.id && edge.target === node2.id && 
            edge.sourceHandle === point1 && edge.targetHandle === point2)
        );

        message = `Disconnected nodes at (${x1}, ${y1}) and (${x2}, ${y2})`;
        break;
      }
    }

    await updateDiagram(updatedNodes, updatedEdges);
    return {
      success: true,
      message,
      nodes: updatedNodes,
      edges: updatedEdges
    };
  };

  const getCurrentDiagram = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/diagram`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data?.nodes || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  };

  const getCurrentEdges = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/diagram`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data?.edges || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  };

  const updateDiagram = async (nodes, edges = []) => {
    const flow = {
      nodes,
      edges
    };

    await axios.post(
      `/api/projects/${projectId}/diagram`,
      flow,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat history
    const userMessage = { type: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Split input into multiple commands by pipe
      const commands = message.split('|').map(cmd => cmd.trim()).filter(cmd => cmd);
      
      // Process each command
      let currentNodes = await getCurrentDiagram();
      let currentEdges = await getCurrentEdges();
      let allMessages = [];

      for (const cmd of commands) {
        try {
          // Parse the command and its arguments
          const parts = cmd.split(',').map(part => part.trim().toLowerCase());
          const command = parts[0];
          const args = parts.slice(1);

          validateCommand(command, args);
          const result = await executeCommand(command, args, currentNodes, currentEdges);
          
          currentNodes = result.nodes;
          currentEdges = result.edges;
          allMessages.push(result.message);
        } catch (error) {
          allMessages.push(`Error in command "${cmd}": ${error.message}`);
          // Continue with next command even if one fails
        }
      }

      // Add all messages to chat history
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: allMessages.join('\n')
      }]);

      // Update diagram with final state
      onDiagramGenerated({ nodes: currentNodes, edges: currentEdges });

    } catch (error) {
      console.error('Command execution error:', error);
      
      setChatHistory(prev => [...prev, { 
        type: 'error', 
        content: error.message || 'Error executing commands'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to initialize local diagram state
  useEffect(() => {
    const initializeDiagram = async () => {
      try {
        const nodes = await getCurrentDiagram();
        const edges = await getCurrentEdges();
        // Convert any existing nodes to use grid positions
        const convertedNodes = nodes.map(node => ({
          ...node,
          position: {
            x: GRID_CONFIG.startX + (node.position.x - 1) * GRID_CONFIG.cellSize,
            y: GRID_CONFIG.startY + (node.position.y - 1) * GRID_CONFIG.cellSize
          }
        }));
        setLocalDiagram({ nodes: convertedNodes, edges });
      } catch (error) {
        console.error('Error initializing diagram:', error);
      }
    };
    initializeDiagram();
  }, []);

  // Handler for AI prompt - DISABLED: Step-based chat system removed
  const handleAiPrompt = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      // TODO: Implement new chat API when available
      console.log('AI prompt feature disabled - step-based chat system removed');
    } catch (err) {
      // Optionally handle error (e.g., show a snackbar)
    } finally {
      setAiLoading(false);
      setAiInput('');
    }
  };

  // --- UI for non-admins: Only input and send button ---
  if (!isAdmin) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
        <Box sx={{ flex: 1 }} />
        <Divider />
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              placeholder="Describe the diagram changes you want..."
              disabled={aiLoading}
              size="small"
              onKeyDown={e => { if (e.key === 'Enter' && !aiLoading) handleAiPrompt(); }}
            />
            <IconButton
              onClick={handleAiPrompt}
              color="primary"
              disabled={aiLoading || !aiInput.trim()}
              sx={{ alignSelf: 'flex-end', backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
            >
              {aiLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  }

  // Admin: render TEMPORARY TEST INTERFACE and AI input (no output box)
  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#fff',
      borderRadius: 1,
      boxShadow: 1
    }}>
      {/* TEMPORARY TEST INTERFACE - ONLY VISIBLE TO ADMIN */}
      <>
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: '#fff3e0'
        }}>
          <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
            [TEMPORARY TEST INTERFACE - WILL BE REMOVED]
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Commands (separate multiple commands with |):
            <br />- add,nodeType,x,y[,label]
            <br />- delete,x,y
            <br />- connect,x1,y1,point1,x2,y2,point2
            <br />- disconnect,x1,y1,point1,x2,y2,point2
            <br />Connection points: top(t), right(r), bottom(b), left(l)
            <br />Example: add,smart-meter,1,1,"Main Meter" | add,meter,2,1 | connect,1,1,right,2,1,left
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder='Example: add,smart-meter,1,1,"Main Meter" | add,meter,2,1 | connect,1,1,right,2,1,left'
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            />
            <Button
              variant="contained"
              color="warning"
              onClick={handleTestSubmit}
              size="small"
            >
              Test
            </Button>
          </Box>
        </Box>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Command Interface
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Available commands: add, delete, connect, disconnect
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Example: add smartmeter 1 2
          </Typography>
        </Box>
      </>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* No AI output box here */}
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            placeholder="Describe the diagram changes you want..."
            disabled={aiLoading}
            size="small"
            onKeyDown={e => { if (e.key === 'Enter' && !aiLoading) handleAiPrompt(); }}
          />
          <IconButton
            onClick={handleAiPrompt}
            color="primary"
            disabled={aiLoading || !aiInput.trim()}
            sx={{ alignSelf: 'flex-end', backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
          >
            {aiLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatDiagramGenerator; 