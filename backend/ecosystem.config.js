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
      env_file: './.env.production', // Use production environment file with correct path
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/home/payamame/nccj/logs/error.log', // Use absolute path for production
      out_file: '/home/payamame/nccj/logs/out.log', // Use absolute path for production
      merge_logs: true,
      time: true,
      // Add more detailed logging
      log_type: 'json',
      // Add debug mode for more verbose logs
      node_args: '--trace-warnings'
    }
  ]
}; 