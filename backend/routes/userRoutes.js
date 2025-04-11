const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Admin only routes
router.route('/')
    .get(authorize('admin'), getUsers)
    .post(authorize('admin'), createUser);

router.route('/:id')
    .get(authorize('admin'), getUser)
    .put(authorize('admin'), updateUser)
    .delete(authorize('admin'), deleteUser);

module.exports = router; 