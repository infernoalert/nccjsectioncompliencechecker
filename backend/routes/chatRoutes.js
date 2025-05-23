const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chatWithAI } = require('../controllers/diagramChatController');
const { nccSectionJChat } = require('../controllers/nccChatController');

router.post('/', protect, chatWithAI);
router.post('/ncc', protect, nccSectionJChat);

module.exports = router; 