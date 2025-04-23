module.exports = {
  apps: [
    {
      name: 'ncc-compliance-backend',
      script: 'server.js',
      instances: 2, // Start with fewer instances for testing
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 9951 // Match the port in .env.production
      },
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_file: '.env.production',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/error.log', // Use relative path
      out_file: 'logs/out.log', // Use relative path
      merge_logs: true,
      time: true,
      log_type: 'json',
      node_args: '--trace-warnings',
      // Add error handling
      max_restarts: 10,
      min_uptime: '5s',
      // Add environment variables for debugging
      env_production: {
        NODE_ENV: 'production',
        PORT: 9951,
        DEBUG: '*'
      }
    }
  ]
}; 