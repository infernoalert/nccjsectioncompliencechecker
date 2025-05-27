const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');

// Load env vars based on environment
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Determine if we're in production environment
// Only use NODE_ENV to determine the environment
const isProduction = process.env.NODE_ENV === 'production';

// Create logs directory if it doesn't exist
const logsDir = isProduction 
  ? '/home/payamame/nccj/logs' 
  : path.join(__dirname, 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log environment information
console.log('Starting server with environment:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
console.log(`PORT: ${process.env.PORT || 5000}`);
console.log(`MONGO_PATH: ${process.env.MONGO_PATH || 'Not set'}`);
console.log(`Logs directory: ${logsDir}`);

// Connect to database
let dbConnection = null;
(async () => {
  try {
    dbConnection = await connectDB();
    if (!dbConnection) {
      console.error('Failed to connect to database. Application will continue but database operations will fail.');
    }
  } catch (error) {
    console.error('Error during database connection:', error);
  }
})();

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
const healthRoutes = require('./routes/healthRoutes');
const EnergyMonitorReportRoutes = require('./routes/energy_monitor_reportRoutes');
const j7lightingReportRoutes = require('./routes/j7lighting_reportRoutes');
const j6hvacReportRoutes = require('./routes/j6hvac_reportRoutes');
const stepRoutes = require('./routes/stepRoutes');
// const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://nccjsectioncompliencechecker.vercel.app', 'https://api.payamamerian.com', 'https://ncc.payamamerian.com'] 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Swagger Documentation
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

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/climate-zones', climateZoneRoutes);
app.use('/api/compliance-pathways', compliancePathwayRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/j9monitor', EnergyMonitorReportRoutes);
app.use('/api', complianceCalculatorRoutes);
app.use('/api', referenceDataRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/j7lighting', j7lightingReportRoutes);
app.use('/api/j6hvac', j6hvacReportRoutes);
app.use('/api', stepRoutes);
// app.use('/api/chat', chatRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || (isProduction ? 9951 : 5000);
const server = app.listen(PORT, () => {
    console.log(`Server running in ${isProduction ? 'production' : 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Unhandled Rejection: ${err.message}`);
    console.error(err.stack);
    // Don't exit the process, just log the error
    // This allows the application to continue running
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Uncaught Exception: ${err.message}`);
    console.error(err.stack);
    // Don't exit the process, just log the error
    // This allows the application to continue running
}); 