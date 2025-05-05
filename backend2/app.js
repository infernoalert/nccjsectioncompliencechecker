const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db.config');
const { PORT } = require('./config/env.config');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/reports', require('./routes/report.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 