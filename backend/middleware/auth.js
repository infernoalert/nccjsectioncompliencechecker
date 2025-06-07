const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided. Please log in to access this route'
            });
        }

        try {
            // Verify token
            const decoded = verifyToken(token);
            
            // Get user from token - try both id and _id
            const userId = decoded._id || decoded.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token format: missing user ID'
                });
            }

            // Get user and explicitly select password if needed
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found. Please log in again'
                });
            }

            // Add user to request object
            req.user = user;
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token. Please log in again'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        next(error);
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize }; 