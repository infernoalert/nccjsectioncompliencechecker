import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Container } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.payamamerian.com' 
  : 'http://localhost:5000';

// Node types mapping
const NODE_TYPES = {
  'smart-meter': 'smartMeter',
  'auth-meter': 'authorityMeter',
  'meter-memory': 'meterMemory',
  'on-premise': 'onPremise',
  'rs485': 'rs485',
  'ethernet': 'ethernet',
  'wireless': 'wireless',
  'cloud': 'cloud',
  'transformer': 'transformer',
  'load': 'load',
  'meter': 'meter',
  'text': 'text',
  'label': 'label'
};

const DiagramChatInterface = ({ onDiagramGenerated }) => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [localDiagram, setLocalDiagram] = useState({ nodes: [], edges: [] });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processCommand = (cmd, currentState) => {
    try {
      const parts = cmd.split(',').map(part => part.trim());
      const command = parts[0];
      
      if (command === 'add') {
        if (parts.length < 4) {
          console.warn('Invalid add command format. Expected: add,type,x,y[,label]');
          return currentState;
        }
        
        const [_, type, x, y, label] = parts;
        const nodeType = NODE_TYPES[type];
        if (!nodeType) {
          console.warn(`Unknown node type: ${type}. Available types:`, Object.keys(NODE_TYPES));
          return currentState;
        }
        
        console.log('Adding new node:', { type: nodeType, x, y, label });
        
        const nodeId = `node-${Date.now()}`;
        const position = {
          x: parseInt(x) * 100,
          y: parseInt(y) * 100
        };
        
        const newNode = {
          id: nodeId,
          type: nodeType,
          position,
          data: { 
            label: label || type,
            width: 100,
            height: 100,
            showHandles: false
          }
        };
        
        return {
          nodes: [...currentState.nodes, newNode],
          edges: currentState.edges
        };
      } else if (command === 'delete-all') {
        console.log('Deleting all nodes and edges');
        return {
          nodes: [],
          edges: []
        };
      } else if (command === 'connect') {
        if (parts.length !== 7) {
          console.warn('Invalid connect command format. Expected: connect,x1,y1,point1,x2,y2,point2');
          return currentState;
        }
        
        const [_, x1, y1, point1, x2, y2, point2] = parts;
        const pos1 = {
          x: parseInt(x1) * 100,
          y: parseInt(y1) * 100
        };
        const pos2 = {
          x: parseInt(x2) * 100,
          y: parseInt(y2) * 100
        };

        const sourceNode = currentState.nodes.find(n => 
          Math.abs(n.position.x - pos1.x) < 1 && 
          Math.abs(n.position.y - pos1.y) < 1
        );
        const targetNode = currentState.nodes.find(n => 
          Math.abs(n.position.x - pos2.x) < 1 && 
          Math.abs(n.position.y - pos2.y) < 1
        );

        if (!sourceNode || !targetNode) {
          console.warn('Could not find source or target node for connection');
          return currentState;
        }

        const newEdge = {
          id: `e${sourceNode.id}-${targetNode.id}-${Date.now()}`,
          source: sourceNode.id,
          target: targetNode.id,
          sourceHandle: point1,
          targetHandle: point2,
          type: 'step',
          style: { stroke: '#000', strokeWidth: 2 },
          animated: false,
          markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20
          }
        };

        return {
          nodes: currentState.nodes,
          edges: [...currentState.edges, newEdge]
        };
      } else {
        console.warn(`Unknown command: ${command}`);
        return currentState;
      }
    } catch (error) {
      console.error('Error processing command:', error);
      return currentState;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          projectId: id,
          message: userMessage,
          history: messages
            .slice(-2)
            .map((msg, i) => msg.role === 'user' ? { user: msg.content, ai: messages[i+1]?.content || '' } : null)
            .filter(Boolean)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Extract the human-readable response (text before any commands)
        const humanResponse = data.response.split('{')[0].trim();
        setMessages(prev => [...prev, { role: 'assistant', content: humanResponse }]);
        
        // Extract and process commands
        const commands = [];
        const regex = /\{([^}]+)\}/g;
        let match;
        while ((match = regex.exec(data.response)) !== null) {
          commands.push(match[1]);
        }

        // Process commands one by one
        if (commands.length > 0 && onDiagramGenerated) {
          let updatedDiagram = { ...localDiagram };
          
          for (const cmd of commands) {
            updatedDiagram = processCommand(cmd, updatedDiagram);
            setLocalDiagram(updatedDiagram);
            onDiagramGenerated(updatedDiagram);
            // Add a small delay between commands
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>
          Diagram Chat Assistant
        </Typography>
        <Box 
          sx={{ 
            flex: 1, 
            mb: 2, 
            p: 2, 
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            borderRadius: 1
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.role === 'user' ? '#e3f2fd' : '#ffffff'
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Paper>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the diagram changes you want..."
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DiagramChatInterface; 