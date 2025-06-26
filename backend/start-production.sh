#!/bin/bash

# Load environment variables from .env.production
# Filter out comments and empty lines, handle array values properly
while IFS= read -r line; do
  # Skip comments and empty lines
  if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
    continue
  fi
  
  # Extract key-value pairs
  if [[ $line =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]// /}"
    value="${BASH_REMATCH[2]}"
    
    # Remove quotes if present
    value="${value#\"}"
    value="${value%\"}"
    
    # Export the variable
    export "${key}=${value}"
  fi
done < .env.production

# Start PM2 with production environment
NODE_ENV=production pm2 start ecosystem.config.js --env production

echo "✅ Production server started with PM2"
echo "📊 Check status with: pm2 status"
echo "📋 Check logs with: pm2 logs" 