const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chatWithAI, updateStep, validateStep, confirmStep } = require('../controllers/chatController');
const { nccSectionJChat } = require('../controllers/nccChatController');
const { getStepRequirements, getStepData, updateStepData } = require('../controllers/chatController');

// Chat with AI about diagram design
router.post('/', protect, chatWithAI);

// Step management
router.put('/step', protect, updateStep);
router.post('/validate', protect, validateStep);
router.post('/confirm', protect, confirmStep);

// NCC Section J specific chat
router.post('/ncc', protect, nccSectionJChat);

// Step requirements routes
router.get('/step-requirements', protect, getStepRequirements);
router.get('/step-data/:id', protect, getStepData);
router.post('/step-data/:id', protect, updateStepData);

module.exports = router; 