import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  CircularProgress, 
  Container,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Popover
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { useTheme } from '@mui/material/styles';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.payamamerian.com' 
  : 'http://localhost:5000';

// Step definitions
const STEPS = {
  INITIAL: 'initial',
  BOM: 'bom',
  DESIGN: 'design',
  REVIEW: 'review',
  FINAL: 'final'
};

const STEP_LABELS = {
  [STEPS.INITIAL]: 'Initial Requirements',
  [STEPS.BOM]: 'Bill of Materials',
  [STEPS.DESIGN]: 'System Design',
  [STEPS.REVIEW]: 'Design Review',
  [STEPS.FINAL]: 'Final Approval'
};

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

const DiagramChatInterface = ({ onDiagramGenerated, onStepChange, currentStep: initialStep }) => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [localDiagram, setLocalDiagram] = useState({ nodes: [], edges: [] });
  const [currentStep, setCurrentStep] = useState(initialStep || STEPS.INITIAL);
  const [stepValidation, setStepValidation] = useState({});
  const [stepConfirmation, setStepConfirmation] = useState({});
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [stepRequirements, setStepRequirements] = useState(null);
  const [stepData, setStepData] = useState({});
  const theme = useTheme();
  // Popup state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);

  // Update currentStep when initialStep changes
  useEffect(() => {
    if (initialStep && initialStep !== currentStep) {
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  // Notify parent of step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update stepRequirements and stepData when chat response changes
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.stepRequirements) {
      setStepRequirements(lastMsg.stepRequirements);
    }
    if (lastMsg && lastMsg.extractedData) {
      setStepData(lastMsg.extractedData);
    }
  }, [messages]);

  // Add a useEffect to fetch step requirements for the current step
  useEffect(() => {
    async function fetchStepRequirements() {
      if (!id || !currentStep) return;
      try {
        const response = await fetch(`${API_URL}/api/projects/${id}/steps/current`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        console.log('Backend step data response:', data); // Debug log
        if (data.stepRequirements) {
          setStepRequirements(data.stepRequirements);
        }
        if (data.stepData) {
          setStepData(data.stepData);
        }
      } catch (error) {
        setStepRequirements([]);
      }
    }
    fetchStepRequirements();
  }, [id, currentStep]);

  const handleStepValidation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/projects/${id}/steps/${currentStep}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          validationData: localDiagram
        })
      });

      const data = await response.json();
      setStepValidation(prev => ({
        ...prev,
        [currentStep]: data
      }));

      if (data.valid) {
        setShowConfirmationDialog(true);
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleStepConfirmation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/projects/${id}/steps/${currentStep}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          notes: confirmationNotes
        })
      });

      const data = await response.json();
      setStepConfirmation(prev => ({
        ...prev,
        [currentStep]: data
      }));

      setShowConfirmationDialog(false);
      setConfirmationNotes('');
    } catch (error) {
      console.error('Confirmation error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, step: currentStep }]);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/projects/${id}/steps/${currentStep}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: data.response, 
          step: currentStep,
          stepRequirements: data.stepRequirements,
          extractedData: data.stepData
        }]);
        if (data.stepData) setStepData(data.stepData);
        if (data.currentStep && data.currentStep !== currentStep) {
          setCurrentStep(data.currentStep);
          if (onStepChange) {
            onStepChange(data.currentStep);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: data.message || 'Error from AI', step: currentStep }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, there was an error processing your request. Please try again.', step: currentStep }]);
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

  const getStepStatus = (step) => {
    if (step === currentStep) return 'active';
    if (stepConfirmation[step]?.confirmed) return 'completed';
    if (stepValidation[step]?.valid) return 'validated';
    return 'pending';
  };

  const getStepIcon = (step) => {
    const status = getStepStatus(step);
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'validated':
        return <WarningIcon color="warning" />;
      case 'active':
        return <InfoIcon color="primary" />;
      default:
        return <InfoIcon color="disabled" />;
    }
  };

  const handleStepLabelClick = (event, step) => {
    setAnchorEl(event.currentTarget);
    setSelectedStep(step);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedStep(null);
  };

  // Before rendering the popup, define:
  const currentStepData = stepData[currentStep] || stepData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>
          Diagram Chat Assistant
        </Typography>

        {/* Step Progress */}
        <Stepper activeStep={Object.keys(STEPS).indexOf(currentStep)} sx={{ mb: 3, overflowX: 'auto' }}>
          {Object.values(STEPS).map((step) => (
            <Step key={step} completed={getStepStatus(step) === 'completed'}>
              <StepLabel
                onClick={(e) => handleStepLabelClick(e, step)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: step === currentStep ? 'success.light' : 'inherit',
                  borderRadius: 1,
                  px: 1,
                  '&:hover': { bgcolor: step === currentStep ? 'success.main' : 'grey.100' },
                  color: step === currentStep ? 'white' : 'inherit',
                  transition: 'background 0.2s',
                }}
                StepIconComponent={() => getStepIcon(step)}
                optional={
                  step === currentStep && stepValidation[step]?.errors?.length > 0 && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {stepValidation[step].errors.join(', ')}
                    </Alert>
                  )
                }
              >
                {STEP_LABELS[step]}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Requirements Popover */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box sx={{ p: 2, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              {STEP_LABELS[selectedStep]} Requirements
            </Typography>
            {stepRequirements && stepRequirements.length > 0 ? (
              stepRequirements.map((field, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {field.label}
                  </Typography>
                  <Typography variant="body2">
                    {field.type === 'boolean'
                      ? (stepData[field.id] === true ? 'Yes' : stepData[field.id] === false ? 'No' : 'Not provided')
                      : (stepData[field.id] ?? 'Not provided')}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No requirements defined for this step.</Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              disabled={
                !stepRequirements || !stepRequirements.every(
                  field => stepData[field.id] !== undefined
                )
              }
              onClick={handleStepConfirmation}
              sx={{ mt: 2, width: '100%' }}
            >
              Confirm Step Values
            </Button>
          </Box>
        </Popover>

        {/* Chat Interface */}
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
        
        {/* Input Area */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Describe the ${currentStep} changes you want...`}
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
          {currentStep === STEPS.DESIGN && (
            <Tooltip title="Validate current design">
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleStepValidation}
                disabled={isLoading}
              >
                Validate
              </Button>
            </Tooltip>
          )}
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmationDialog} onClose={() => setShowConfirmationDialog(false)}>
        <DialogTitle>Confirm Step Completion</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={confirmationNotes}
            onChange={(e) => setConfirmationNotes(e.target.value)}
            placeholder="Add any notes about this step..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmationDialog(false)}>Cancel</Button>
          <Button onClick={handleStepConfirmation} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DiagramChatInterface; 