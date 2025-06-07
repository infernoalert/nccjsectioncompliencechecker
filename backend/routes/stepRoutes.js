const express = require('express');
const router = express.Router();
const steps = require('../data/steps.json');
const projectSteps = require('../data/projectSteps');
const diagramChatController = require('../controllers/diagramChatController');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');

// Add mapping from step keys to step numbers
const STEP_KEY_TO_NUMBER = {
  initial: 1,
  bom: 2,
  design: 3,
  review: 4,
  final: 5
};

/**
 * @swagger
 * /api/projects/{projectId}/steps/current:
 *   get:
 *     summary: Get the current step and its data for a project
 *     tags: [Steps]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Current step, definition, and data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentStep:
 *                   type: integer
 *                 stepDef:
 *                   type: object
 *                 stepData:
 *                   type: object
 */
router.get('/projects/:projectId/steps/current', async (req, res) => {
  const { projectId } = req.params;
  try {
    // Find the conversation for this project
    const conversation = await Conversation.findOne({ project: projectId });
    if (conversation) {
      // Map string step key to step number
      const stepKey = conversation.currentStep;
      const stepNumber = STEP_KEY_TO_NUMBER[stepKey] || stepKey;
      const stepDef = steps.find(s => s.step === stepNumber);
      const stepRequirements = stepDef ? stepDef.fields : [];
      res.json({
        currentStep: conversation.currentStep,
        stepDef,
        stepData: (conversation.stepData.get
          ? conversation.stepData.get(conversation.currentStep)
          : conversation.stepData[conversation.currentStep]) || {},
        stepRequirements
      });
    } else {
      // Fallback to in-memory projectSteps if no conversation exists
      const project = projectSteps[projectId] || { currentStep: 1, stepData: {} };
      const stepDef = steps.find(s => s.step === project.currentStep);
      const stepRequirements = stepDef ? stepDef.fields : [];
      res.json({
        currentStep: project.currentStep,
        stepDef,
        stepData: project.stepData[project.currentStep] || {},
        stepRequirements
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current step data', error: error.message });
  }
});

/**
 * @swagger
 * /api/projects/{projectId}/steps/{stepNumber}:
 *   post:
 *     summary: Update data for a specific step in a project
 *     tags: [Steps]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *       - in: path
 *         name: stepNumber
 *         schema:
 *           type: integer
 *         required: true
 *         description: The step number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Step data updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stepData:
 *                   type: object
 */
router.post('/projects/:projectId/steps/:stepNumber', async (req, res) => {
  const { projectId, stepNumber } = req.params;
  const update = req.body;

  // Find the step definition and requirements
  const stepDef = steps.find(s => s.step === Number(stepNumber));
  const stepRequirements = stepDef ? stepDef.fields : [];

  // Get existing step data (from memory for now)
  if (!projectSteps[projectId]) projectSteps[projectId] = { currentStep: Number(stepNumber), stepData: {} };
  const existingStepData = projectSteps[projectId].stepData[stepNumber] || {};

  // LOGGING
  console.log('--- Step Update Request ---');
  console.log('Project:', projectId, 'Step:', stepNumber);
  console.log('Existing Step Data:', JSON.stringify(existingStepData));
  console.log('Incoming Update:', JSON.stringify(update));

  // Merge update with existing data
  const mergedStepData = { ...existingStepData, ...update };

  // Ensure all required fields are present
  stepRequirements.forEach(req => {
    if (!(req.id in mergedStepData)) {
      mergedStepData[req.id] = null; // or a sensible default
    }
  });

  // LOGGING
  console.log('Merged Step Data (to be saved):', JSON.stringify(mergedStepData));

  // Save merged data
  projectSteps[projectId].stepData[stepNumber] = mergedStepData;
  res.json({ success: true, stepData: mergedStepData });
});

/**
 * @swagger
 * /api/projects/{projectId}/steps/{stepNumber}/confirm:
 *   post:
 *     summary: Confirm a step and move to the next step
 *     tags: [Steps]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *       - in: path
 *         name: stepNumber
 *         schema:
 *           type: integer
 *         required: true
 *         description: The step number
 *     responses:
 *       200:
 *         description: Step confirmed and next step info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 nextStep:
 *                   type: integer
 *                 message:
 *                   type: string
 */
router.post('/projects/:projectId/steps/:stepNumber/confirm', (req, res) => {
  const { projectId, stepNumber } = req.params;
  const stepDef = steps.find(s => s.step === Number(stepNumber));
  if (stepDef && stepDef.next) {
    projectSteps[projectId].currentStep = stepDef.next;
    res.json({ success: true, nextStep: stepDef.next });
  } else {
    res.json({ success: true, nextStep: null, message: "No more steps" });
  }
});

/**
 * @swagger
 * /api/projects/{projectId}/steps/next:
 *   post:
 *     summary: Move to the next step
 *     tags: [Steps]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Successfully moved to next step
 *       404:
 *         description: Project or conversation not found
 */
router.post('/projects/:projectId/steps/next', async (req, res) => {
  try {
    console.log('\n=== Next Step Request ===');
    console.log('Project ID:', req.params.projectId);
    
    const projectId = req.params.projectId;
    const conversation = await Conversation.findOne({ project: projectId });
    
    if (!conversation) {
      console.log('No conversation found for project:', projectId);
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const currentStep = conversation.currentStep;
    console.log('Current step:', currentStep);
    
    // Get the next step from steps.json
    const currentStepData = steps.find(step => step.key === currentStep);
    
    if (!currentStepData || !currentStepData.next) {
      console.log('No next step available - reached end of workflow');
      return res.status(200).json({ 
        success: true, 
        message: 'No next step available',
        isLastStep: true 
      });
    }

    const nextStep = currentStepData.next;
    console.log('Moving from step', currentStep, 'to step', nextStep);
    
    // Update the conversation with the new step
    conversation.currentStep = nextStep;
    await conversation.save();
    
    console.log('Successfully updated conversation to step:', nextStep);
    console.log('=== Next Step Request Complete ===\n');
    
    res.json({ 
      success: true, 
      nextStep,
      message: 'Successfully moved to next step'
    });
  } catch (error) {
    console.error('Error in next step route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error moving to next step',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/projects/{projectId}/steps/{stepNumber}/diagram:
 *   get:
 *     summary: Get the diagram for a specific step in a project
 *     tags: [Steps]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *       - in: path
 *         name: stepNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: The step number or key
 *     responses:
 *       200:
 *         description: Diagram for the step
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 edges:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/projects/:projectId/steps/:stepNumber/diagram', (req, res) => {
  const { projectId, stepNumber } = req.params;
  if (
    projectSteps[projectId] &&
    projectSteps[projectId].stepData &&
    projectSteps[projectId].stepData[stepNumber] &&
    projectSteps[projectId].stepData[stepNumber].diagram
  ) {
    return res.json(projectSteps[projectId].stepData[stepNumber].diagram);
  }
  // Return empty diagram if not found
  res.json({ nodes: [], edges: [] });
});

/**
 * @swagger
 * /api/projects/{projectId}/steps/{stepKey}:
 *   get:
 *     summary: Get requirements and data for a specific step in a project
 *     tags: [Steps]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The project ID
 *       - in: path
 *         name: stepKey
 *         schema:
 *           type: string
 *         required: true
 *         description: The step key or number
 *     responses:
 *       200:
 *         description: Step requirements and data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stepKey:
 *                   type: string
 *                 stepDef:
 *                   type: object
 *                 stepData:
 *                   type: object
 *                 stepRequirements:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/projects/:projectId/steps/:stepKey', async (req, res) => {
  const { projectId, stepKey } = req.params;
  try {
    const conversation = await Conversation.findOne({ project: projectId });
    const stepNumber = STEP_KEY_TO_NUMBER[stepKey] || Number(stepKey);
    const stepDef = steps.find(s => s.step === stepNumber);
    const stepRequirements = stepDef ? stepDef.fields : [];
    let stepData = {};
    if (conversation) {
      stepData = (conversation.stepData.get
        ? conversation.stepData.get(stepKey)
        : conversation.stepData[stepKey]) || {};
    }
    res.json({
      stepKey,
      stepDef,
      stepData,
      stepRequirements
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching step data', error: error.message });
  }
});

// Add chatWithAI endpoint for step-based chat
router.post('/projects/:projectId/steps/:stepNumber/chat', protect, diagramChatController.chatWithAI);

module.exports = router; 