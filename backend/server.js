const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

console.log('🚀 Starting server initialization...');

// Load env vars based on environment
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
console.log(`📁 Loading environment from: ${envFile}`);
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log('✅ Environment variables loaded');

// Determine if we're in production environment
// Only use NODE_ENV to determine the environment
const isProduction = process.env.NODE_ENV === 'production';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log environment information
console.log('🌍 Environment Information:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
console.log(`PORT: ${process.env.PORT || process.env.HTTP_PORT || 5000}`);
console.log(`MONGO_PATH: ${process.env.MONGO_PATH || 'Not set'}`);
console.log(`Logs directory: ${logsDir}`);

// Connect to database
console.log('🔌 Connecting to database...');
let dbConnection = null;
(async () => {
  try {
    dbConnection = await connectDB();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Server will continue but database operations will fail.');
    // Don't exit - let the application continue running
  }
})();

// Import routes
console.log('📂 Loading route modules...');
const userRoutes = require('./routes/userRoutes');
console.log('✅ userRoutes loaded');
const authRoutes = require('./routes/authRoutes');
console.log('✅ authRoutes loaded');
const climateZoneRoutes = require('./routes/climateZoneRoutes');
console.log('✅ climateZoneRoutes loaded');
const compliancePathwayRoutes = require('./routes/compliancePathwayRoutes');
console.log('✅ compliancePathwayRoutes loaded');
const projectRoutes = require('./routes/projectRoutes');
console.log('✅ projectRoutes loaded');
const complianceCalculatorRoutes = require('./routes/complianceCalculatorRoutes');
console.log('✅ complianceCalculatorRoutes loaded');
const referenceDataRoutes = require('./routes/referenceDataRoutes');
console.log('✅ referenceDataRoutes loaded');
const adminRoutes = require('./routes/adminRoutes');
console.log('✅ adminRoutes loaded');
const testRoutes = require('./routes/testRoutes');
console.log('✅ testRoutes loaded');
const healthRoutes = require('./routes/healthRoutes');
console.log('✅ healthRoutes loaded');
const EnergyMonitorReportRoutes = require('./routes/energy_monitor_reportRoutes');
console.log('✅ EnergyMonitorReportRoutes loaded');
const J7LightingReportRoutes = require('./routes/j7lighting_reportRoutes');
console.log('✅ J7LightingReportRoutes loaded');
const J6hvacReportRoutes = require('./routes/j6hvac_reportRoutes');
console.log('✅ J6hvacReportRoutes loaded');
const projectValueRoutes = require('./routes/projectValueRoutes');
console.log('✅ projectValueRoutes loaded');
const energyDiagramRoutes = require('./routes/energyDiagramRoutes');
console.log('✅ energyDiagramRoutes loaded');

const app = express();

// Middleware
console.log('⚙️ Setting up middleware...');
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://nccjsectioncompliencechecker.vercel.app', 'https://api.payamamerian.com', 'https://ncc.payamamerian.com'] 
    : 'http://localhost:3000',
  credentials: true
}));
console.log('✅ CORS configured');

app.use(express.json());
console.log('✅ JSON parser configured');

app.use(morgan('dev'));
console.log('✅ Morgan logger configured');

// Swagger Documentation
console.log('📖 Setting up Swagger documentation...');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    defaultModelRendering: 'model',
    displayOperationId: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    deepLinking: true,
    syntaxHighlight: {
      theme: 'monokai'
    },
    tryItOutEnabled: true,
    // Use the current host for requests
    url: process.env.NODE_ENV === 'production' 
      ? 'https://api.payamamerian.com' 
      : 'http://localhost:5000',
    // Disable host validation
    validatorUrl: null,
    requestInterceptor: (req) => {
      // Add a timestamp to bypass cache
      const timestamp = new Date().getTime();
      const separator = req.url.includes('?') ? '&' : '?';
      req.url = `${req.url}${separator}_=${timestamp}`;
      return req;
    }
  }
}));
console.log('✅ Swagger documentation configured');

// Health check route
console.log('🛣️ Setting up routes...');
app.use('/health', healthRoutes);

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', energyDiagramRoutes);
app.use('/api/climate-zones', climateZoneRoutes);
app.use('/api/compliance-pathways', compliancePathwayRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/j9monitor', EnergyMonitorReportRoutes);
app.use('/api', complianceCalculatorRoutes);
app.use('/api', referenceDataRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/j7lighting', J7LightingReportRoutes);
app.use('/api/j6hvac', J6hvacReportRoutes);
app.use('/api/projects', projectValueRoutes);
console.log('✅ All routes configured');

// Basic route
console.log('📖 Setting up basic route...');
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Test route for device type updater
console.log('🧪 Setting up test route for device type updater...');
const updateDeviceTypesByProjectSize = require('./utils/deviceTypeUpdater');
app.get('/test-device-updater/:projectId', async (req, res) => {
    try {
        console.log('🧪 TEST ROUTE: Device Type Updater called via API');
        const projectId = req.params.projectId;
        const result = await updateDeviceTypesByProjectSize(projectId);
        res.json({ 
            success: true, 
            result,
            message: 'Device type updater completed successfully'
        });
    } catch (error) {
        console.error('❌ TEST ROUTE ERROR:', error);
        res.json({ 
            success: false, 
            error: error.message,
            stack: error.stack
        });
    }
});
console.log('✅ Test routes configured');

// Error handling middleware
console.log('🎯 Setting up error handling middleware...');
app.use(errorHandler);
console.log('✅ Error handling middleware configured');

// Start server
console.log('🎯 Starting server...');
const PORT = process.env.PORT || process.env.HTTP_PORT || (isProduction ? 9951 : 5000);
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${isProduction ? 'production' : 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
console.log('🔄 Setting up unhandled promise rejection handler...');
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Unhandled Rejection: ${err.message}`);
    console.error(err.stack);
    // Don't exit the process, just log the error
    // This allows the application to continue running
});

// Handle uncaught exceptions
console.log('🔄 Setting up uncaught exception handler...');
process.on('uncaughtException', (err) => {
    console.log(`❌ Uncaught Exception: ${err.message}`);
    console.error(err.stack);
    // Don't exit the process, just log the error
    // This allows the application to continue running
}); 
