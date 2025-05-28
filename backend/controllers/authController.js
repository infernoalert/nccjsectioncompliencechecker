const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        
        console.log('Registration request:', { email, role });
        console.log('ALLOW_ADMIN_REGISTRATION:', process.env.ALLOW_ADMIN_REGISTRATION);
        console.log('Type of ALLOW_ADMIN_REGISTRATION:', typeof process.env.ALLOW_ADMIN_REGISTRATION);

        // Check if admin registration is allowed
        if (role === 'admin' && process.env.ALLOW_ADMIN_REGISTRATION !== 'true') {
            console.log('Admin registration blocked. Value:', process.env.ALLOW_ADMIN_REGISTRATION);
            return res.status(403).json({
                success: false,
                error: 'Admin registration is not allowed'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            role: role || 'user', // Default to user role if not specified
            name: email.split('@')[0] // Use email prefix as name
        });

        // Generate token
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: Object.values(error.errors).map(err => err.message).join(', ')
            });
        }
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}; 