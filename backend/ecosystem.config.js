module.exports = {
  apps: [
    {
      name: 'ncc-compliance-backend',
      script: 'server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Run in cluster mode for load balancing
      autorestart: true,
      watch: false,
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_file: '.env.production', // Use production environment file
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      time: true
    }
  ]
}; 