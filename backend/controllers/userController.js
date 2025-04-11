const User = require('../models/User');

// Get all users
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// Get single user
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Create user
exports.createUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Update user
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
}; 