require('dotenv').config({ path: '.env.development' });

module.exports = {
  // Server Configuration
  PORT: process.env.HTTP_PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',

  // MongoDB Configuration
  MONGO_URI: process.env.MONGO_URI || `mongodb://${process.env.MONGO_PATH || '127.0.0.1'}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DATABASE || 'ncc-compliance'}`,

  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'ncc_compliance_secret_key_2024',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '30d',
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  ALLOW_ADMIN_REGISTRATION: process.env.ALLOW_ADMIN_REGISTRATION === 'true',

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs/development.log',

  // OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK: process.env.GOOGLE_CALLBACK,
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  LINKEDIN_CALLBACK: process.env.LINKEDIN_CALLBACK,

  // Email Service Configuration
  NODE_MAILER_FROM: process.env.NODE_MAILER_FROM,
  NODE_MAILER_HOST: process.env.NODE_MAILER_HOST,
  NODE_MAILER_PORT: parseInt(process.env.NODE_MAILER_PORT) || 465,
  NODE_MAILER_USER: process.env.NODE_MAILER_USER,
  NODE_MAILER_PASSWORD: process.env.NODE_MAILER_PASSWORD
}; 