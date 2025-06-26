#!/bin/bash

# Load environment variables from .env.production
export $(cat .env.production | grep -v '^#' | xargs)

# Start PM2 with production environment
NODE_ENV=production pm2 start ecosystem.config.js --env production

echo "✅ Production server started with PM2"
echo "📊 Check status with: pm2 status"
echo "📋 Check logs with: pm2 logs" 