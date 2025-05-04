const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
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

// @desc    Revoke user access
// @route   PUT /api/admin/users/:id/revoke
// @access  Private/Admin
exports.revokeUserAccess = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update user's active status
        user.isActive = false;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Restore user access
// @route   PUT /api/admin/users/:id/restore
// @access  Private/Admin
exports.restoreUserAccess = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update user's active status
        user.isActive = true;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (error) {
        next(error);
    }
}; 