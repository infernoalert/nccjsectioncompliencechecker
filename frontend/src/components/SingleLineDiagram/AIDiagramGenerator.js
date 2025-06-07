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

const AIDiagramGenerator = ({ onDiagramGenerated }) => {
  const { id: projectId } = useParams();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

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
      // Call AI service to generate commands
      const response = await axios.post(
        '/api/ai/generate-diagram-commands',
        { 
          message,
          currentNodes: await getCurrentDiagram(),
          currentEdges: await getCurrentEdges()
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { commands, explanation } = response.data;

      // Add AI's explanation to chat history
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: explanation
      }]);

      // Execute the generated commands
      let currentNodes = await getCurrentDiagram();
      let currentEdges = await getCurrentEdges();
      let allMessages = [];

      for (const cmd of commands) {
        try {
          const parts = cmd.split(',').map(part => part.trim().toLowerCase());
          const command = parts[0];
          const args = parts.slice(1);

          // Execute command using the existing command execution logic
          const result = await executeCommand(command, args, currentNodes, currentEdges);
          
          currentNodes = result.nodes;
          currentEdges = result.edges;
          allMessages.push(result.message);
        } catch (error) {
          allMessages.push(`Error in command "${cmd}": ${error.message}`);
        }
      }

      // Add execution results to chat history
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: allMessages.join('\n')
      }]);

      // Update diagram with final state
      onDiagramGenerated({ nodes: currentNodes, edges: currentEdges });

    } catch (error) {
      console.error('AI command generation error:', error);
      
      setChatHistory(prev => [...prev, { 
        type: 'error', 
        content: error.message || 'Error generating or executing commands'
      }]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#fff',
      borderRadius: 1,
      boxShadow: 1
    }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          AI Diagram Generator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Describe the diagram you want to create in natural language
        </Typography>
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {chatHistory.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              mb: 1
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '80%',
                backgroundColor: msg.type === 'user' ? '#e3f2fd' : 
                              msg.type === 'error' ? '#ffebee' : '#f5f5f5',
                borderRadius: 2
              }}
            >
              <Typography variant="body1">
                {msg.content}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the diagram you want to create..."
              disabled={isLoading}
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <IconButton 
              type="submit" 
              color="primary" 
              disabled={isLoading || !message.trim()}
              sx={{ 
                alignSelf: 'flex-end',
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AIDiagramGenerator; 