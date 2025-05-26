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
  Tooltip
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

const DiagramChatInterface = ({ onDiagramGenerated }) => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [localDiagram, setLocalDiagram] = useState({ nodes: [], edges: [] });
  const [currentStep, setCurrentStep] = useState(STEPS.INITIAL);
  const [stepValidation, setStepValidation] = useState({});
  const [stepConfirmation, setStepConfirmation] = useState({});
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [stepRequirements, setStepRequirements] = useState(null);
  const [stepData, setStepData] = useState({});
  const theme = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update stepRequirements and stepData when chat response changes
  useEffect(() => {
    // Placeholder: update these from the latest chat response or backend
    // For now, just set from the last message if available
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.stepRequirements) {
      setStepRequirements(lastMsg.stepRequirements);
    }
    if (lastMsg && lastMsg.extractedData) {
      setStepData(lastMsg.extractedData);
    }
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
        
        const [, type, x, y, label] = parts;
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
        
        const [, x1, y1, point1, x2, y2, point2] = parts;
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

  const handleStepValidation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conversationId: id,
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
      const response = await fetch(`${API_URL}/api/chat/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conversationId: id,
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
            .filter(Boolean),
          currentStep
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update current step if changed
        if (data.currentStep && data.currentStep !== currentStep) {
          setCurrentStep(data.currentStep);
        }

        // Extract the human-readable response
        const humanResponse = data.response.split('{')[0].trim();
        setMessages(prev => [...prev, { role: 'assistant', content: humanResponse }]);
        
        // Process commands if in design step
        if (currentStep === STEPS.DESIGN) {
          const commands = [];
          const regex = /\{([^}]+)\}/g;
          let match;
          while ((match = regex.exec(data.response)) !== null) {
            commands.push(match[1]);
          }

          if (commands.length > 0 && onDiagramGenerated) {
            let updatedDiagram = { ...localDiagram };
            for (const cmd of commands) {
              updatedDiagram = processCommand(cmd, updatedDiagram);
              setLocalDiagram(updatedDiagram);
              onDiagramGenerated(updatedDiagram);
              await new Promise(resolve => setTimeout(resolve, 100));
            }
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
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>
          Diagram Chat Assistant
        </Typography>

        {/* Step Progress */}
        <Stepper activeStep={Object.keys(STEPS).indexOf(currentStep)} sx={{ mb: 3 }}>
          {Object.values(STEPS).map((step) => (
            <Step key={step} completed={getStepStatus(step) === 'completed'}>
              <StepLabel
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
        
        {/* Step Requirements and Values Section */}
        {stepRequirements && (
          <Box sx={{ mt: 2, mb: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, background: theme.palette.background.paper }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Current Step: {STEP_LABELS[currentStep]}</Typography>
            {stepRequirements.requiredFields.map(field => (
              <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ minWidth: 180 }}>{field.description}:</Typography>
                <Typography
                  sx={{
                    color: stepData?.[field.id] !== undefined ? 'text.primary' : 'error.main',
                    fontWeight: stepData?.[field.id] !== undefined ? 'normal' : 'bold'
                  }}
                >
                  {stepData?.[field.id] !== undefined
                    ? String(stepData[field.id])
                    : 'Required'}
                </Typography>
              </Box>
            ))}
            <Button
              variant="contained"
              color="primary"
              disabled={!stepRequirements.requiredFields.every(field => stepData?.[field.id] !== undefined)}
              onClick={handleStepConfirmation}
              sx={{ mt: 2 }}
            >
              Confirm Step Values
            </Button>
          </Box>
        )}

        {/* Input Area */}
        <Box sx={{ display: 'flex', gap: 1 }}>
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