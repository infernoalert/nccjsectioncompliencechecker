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

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const ChatDiagramGenerator = ({ onDiagramGenerated }) => {
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

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat history
    const userMessage = { type: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setError(null);

    let retryCount = 0;
    let lastError = null;

    while (retryCount < MAX_RETRIES) {
      try {
        console.log(`Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        console.log('Sending interpret-chat request:', {
          projectId,
          message: userMessage.content,
          chatHistory: chatHistory.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        });

        // Step 1: Interpret chat to design plan
        const interpretResponse = await axios.post(
          `/api/projects/${projectId}/interpret-chat`,
          { 
            projectId,
            message: userMessage.content,
            chatHistory: chatHistory.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            }))
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Interpret response:', interpretResponse.data);

        if (!interpretResponse.data.nodes || !interpretResponse.data.edges) {
          throw new Error('Invalid response from server: missing nodes or edges');
        }

        // Step 2: Generate diagram layout
        console.log('Sending generate-layout request:', interpretResponse.data);
        const layoutResponse = await axios.post(
          `/api/projects/${projectId}/generate-layout`,
          {
            nodes: interpretResponse.data.nodes,
            connections: interpretResponse.data.edges
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Layout response:', layoutResponse.data);

        if (!layoutResponse.data.nodes || !layoutResponse.data.edges) {
          throw new Error('Invalid response from server: missing nodes or edges in layout');
        }

        // Add AI response to chat history
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          content: 'Diagram generated successfully! The layout has been updated based on your description.'
        }]);

        // Pass the generated diagram to the parent component
        onDiagramGenerated(layoutResponse.data);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, {
          error,
          response: error.response?.data,
          status: error.response?.status
        });

        lastError = error;
        retryCount++;

        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY}ms...`);
          await sleep(RETRY_DELAY);
        }
      }
    }

    // If we get here, all retries failed
    let errorMessage = 'Error generating diagram';
    
    if (lastError.response?.data?.message) {
      errorMessage = lastError.response.data.message;
    } else if (lastError.response?.data?.error) {
      errorMessage = lastError.response.data.error;
    } else if (lastError.message) {
      errorMessage = lastError.message;
    }

    if (lastError.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (lastError.response?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    }

    // Add error message to chat history
    setChatHistory(prev => [...prev, { 
      type: 'error', 
      content: errorMessage 
    }]);
    setError(errorMessage);
    setIsLoading(false);
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
          Diagram Assistant
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Describe your EMS diagram requirements
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
              placeholder="Describe the EMS diagram you want to create..."
              disabled={isLoading}
              size="small"
              multiline
              maxRows={4}
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

export default ChatDiagramGenerator; 