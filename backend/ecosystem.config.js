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
        PORT: 9951,
        DEBUG: 'app:*',
        MONGO_PATH: '136.243.36.77',
        MONGO_PORT: '27017',
        MONGO_DATABASE: process.env.MONGO_DATABASE,
        MONGO_USER: process.env.MONGO_USER,
        MONGO_PASSWORD: process.env.MONGO_PASSWORD,
        API_URL: 'http://136.243.36.77:9951'
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