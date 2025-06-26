module.exports = {
  apps: [
    {
      name: 'ncc-compliance-backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.HTTP_PORT || 9951,
        DEBUG: 'app:*',
        MONGO_PATH: process.env.MONGO_PATH,
        MONGO_PORT: process.env.MONGO_PORT,
        MONGO_DATABASE: process.env.MONGO_DATABASE,
        MONGO_USER: process.env.MONGO_USER,
        MONGO_PASSWORD: process.env.MONGO_PASSWORD,
        API_URL: process.env.BASE_URL,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        JWT_SECRET: process.env.JWT_SECRET,
        CORS_ORIGIN: process.env.CORS_ORIGIN
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        DEBUG: 'app:*',
        MONGO_PATH: 'localhost',
        MONGO_PORT: '27017',
        MONGO_DATABASE: 'ncc-compliance',
        MONGO_USER: 'admin',
        MONGO_PASSWORD: 'admin'
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true
    }
  ]
}; 