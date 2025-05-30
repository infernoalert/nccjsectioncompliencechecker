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
  Tooltip,
  Popover
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

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

// Add mapping from step keys to step numbers
const STEP_KEY_TO_NUMBER = {
  initial: 1,
  bom: 2,
  design: 3,
  review: 4,
  final: 5
};

const STEP_LABELS = {
  [STEPS.INITIAL]: 'Initial Requirements',
  [STEPS.BOM]: 'Bill of Materials',
  [STEPS.DESIGN]: 'System Design',
  [STEPS.REVIEW]: 'Design Review',
  [STEPS.FINAL]: 'Final Approval'
};

const DiagramChatInterface = ({ onDiagramGenerated, onStepChange, currentStep: initialStep }) => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(initialStep || STEPS.INITIAL);
  const [stepValidation, setStepValidation] = useState({});
  const [stepRequirements, setStepRequirements] = useState(null);
  const [stepData, setStepData] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  // Popup state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);

  // Update currentStep when initialStep changes
  useEffect(() => {
    if (initialStep && initialStep !== currentStep) {
      setCurrentStep(initialStep);
    }
  }, [initialStep, currentStep]);

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

  // Only fetch requirements for the current step on mount or when currentStep changes
  useEffect(() => {
    async function fetchStepRequirements() {
      if (!id) return;
      try {
        const response = await fetch(`${API_URL}/api/projects/${id}/steps/${currentStep}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setStepRequirements(data.stepRequirements || []);
        setStepData(data.stepData || {});
      } catch (error) {
        setStepRequirements([]);
        setStepData({});
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
          validationData: {}
        })
      });

      const data = await response.json();
      setStepValidation(prev => ({
        ...prev,
        [currentStep]: data
      }));
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleNextStep = async () => {
    try {
      console.log('Next Step button clicked for project:', id);
      
      // First, save the current step data
      const stepNumber = STEP_KEY_TO_NUMBER[currentStep];
      if (!stepNumber) {
        console.error('Invalid step key:', currentStep);
        return;
      }
      
      console.log('Saving current step data for step:', stepNumber, 'Data:', stepData);
      
      const saveResponse = await fetch(`${API_URL}/api/projects/${id}/steps/${stepNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(stepData)
      });
      
      const saveData = await saveResponse.json();
      console.log('Save step data response:', saveData);
      
      if (!saveData.success) {
        console.error('Failed to save step data:', saveData.message);
        return;
      }

      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      
      // Determine next step
      const currentStepIndex = Object.values(STEPS).indexOf(currentStep);
      const nextStep = Object.values(STEPS)[currentStepIndex + 1];
      
      if (nextStep) {
        setCurrentStep(nextStep);
        if (onStepChange) {
          onStepChange(nextStep);
        }
      } else {
        console.log('No more steps available');
      }
    } catch (error) {
      console.error('Error moving to next step:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, step: currentStep }]);
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug token
      
      const response = await fetch(`${API_URL}/api/projects/${id}/steps/${currentStep}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      
      console.log('Response status:', response.status); // Debug response status
      const data = await response.json();
      console.log('Response data:', data); // Debug response data
      
      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: data.message,
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
      console.error('Chat error:', error); // Debug error
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
    if (completedSteps.has(step)) return 'completed';
    return 'pending';
  };

  const getStepIcon = (step) => {
    const status = getStepStatus(step);
    switch (status) {
      case 'completed':
        return <WarningIcon color="success" />;
      case 'active':
        return <InfoIcon color="primary" />;
      default:
        return <InfoIcon color="disabled" />;
    }
  };

  const handleStepLabelClick = async (event, step) => {
    setAnchorEl(event.currentTarget);
    setSelectedStep(step);
    // Fetch requirements/data for the clicked step
    try {
      const response = await fetch(`${API_URL}/api/projects/${id}/steps/${step}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStepRequirements(data.stepRequirements || []);
      setStepData(data.stepData || {});
    } catch (error) {
      setStepRequirements([]);
      setStepData({});
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedStep(null);
  };

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
              {selectedStep ? STEP_LABELS[selectedStep] : STEP_LABELS[currentStep]} Requirements
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
                      : field.type === 'array' && field.id === 'buildingServices'
                      ? Object.entries(stepData[field.id] || {}).map(([key, value]) => (
                          <Box key={key} sx={{ ml: 2 }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}: {value ? 'Yes' : 'No'}
                          </Box>
                        ))
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
              onClick={handleNextStep}
              sx={{ mt: 2, width: '100%' }}
            >
              Next Step
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
    </Container>
  );
};

export default DiagramChatInterface; 