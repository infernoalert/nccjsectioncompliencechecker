import React, { useState } from 'react';
import { Button, Box, Typography, Alert, TextField, Paper, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.payamamerian.com' 
  : 'http://localhost:5000';

const EnergyDiagramTest = () => {
  const { id } = useParams();
  const [projectId, setProjectId] = useState(id || '684a53d0312f7c81654304c4');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testEnergyDiagramAPI = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing energy diagram API for project:', projectId);
      
      const response = await axios.post(`${API_URL}/api/projects/${projectId}/energy-diagram/generate`, {
        saveToFile: false
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setResult(response.data);
        console.log('✅ API Test Successful:', response.data);
      } else {
        throw new Error(response.data.error || 'API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ API Test Failed:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error.response?.status === 400) {
        errorMessage = error.response.data.error || 'No energy monitoring devices found for this project';
      } else if (error.response?.status === 404) {
        errorMessage = 'Project not found';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else {
        errorMessage = error.response?.data?.error || error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔌 Energy Diagram API Test
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Configuration
        </Typography>
        
        <TextField
          fullWidth
          label="Project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          sx={{ mb: 2 }}
          helperText="Enter the project ID to test energy diagram generation"
        />
        
        <Button
          variant="contained"
          size="large"
          onClick={testEnergyDiagramAPI}
          disabled={isLoading || !projectId}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{
            backgroundColor: '#2E7D32',
            '&:hover': {
              backgroundColor: '#1B5E20',
            }
          }}
        >
          {isLoading ? 'Testing API...' : '🧪 Test Energy Diagram API'}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            API Test Failed
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      )}

      {result && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              ✅ API Test Successful!
            </Typography>
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            API Response Summary:
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              • Commands Generated: {result.commands?.length || 0}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              • Node Count: {result.metadata?.nodeCount || 0}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              • Device Count: {result.metadata?.deviceCount || 0}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              • Meter Types: {result.metadata?.meterTypes?.join(', ') || 'None'}
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            Sample Commands (First 10):
          </Typography>
          
          <Box sx={{ backgroundColor: '#f0f0f0', p: 2, borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
            <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              {result.commands?.slice(0, 10).join('\n') || 'No commands generated'}
            </pre>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Full response logged to browser console for detailed inspection.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default EnergyDiagramTest; 