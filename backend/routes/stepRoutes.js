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
router.post('/projects/:projectId/steps/:stepNumber', (req, res) => {
  const { projectId, stepNumber } = req.params;
  const data = req.body;
  if (!projectSteps[projectId]) projectSteps[projectId] = { currentStep: Number(stepNumber), stepData: {} };
  projectSteps[projectId].stepData[stepNumber] = data;
  res.json({ success: true, stepData: data });
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

// Add chatWithAI endpoint for step-based chat
router.post('/projects/:projectId/steps/:stepNumber/chat', protect, diagramChatController.chatWithAI);

router.get('/steps-test', (req, res) => {
  res.json({ message: 'Steps route is working!' });
});

module.exports = router; 