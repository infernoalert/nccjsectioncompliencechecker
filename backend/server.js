const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const climateZoneRoutes = require('./routes/climateZoneRoutes');
const compliancePathwayRoutes = require('./routes/compliancePathwayRoutes');
const projectRoutes = require('./routes/projectRoutes');
const complianceCalculatorRoutes = require('./routes/complianceCalculatorRoutes');
const referenceDataRoutes = require('./routes/referenceDataRoutes');
const adminRoutes = require('./routes/adminRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/climate-zones', climateZoneRoutes);
app.use('/api/compliance-pathways', compliancePathwayRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', complianceCalculatorRoutes);
app.use('/api', referenceDataRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
}); 