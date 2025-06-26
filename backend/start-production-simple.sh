#!/bin/bash

echo "🚀 Starting NCC Compliance Backend in Production Mode"

# Stop any existing PM2 processes
pm2 delete ncc-compliance-backend 2>/dev/null || true

# Test environment variables loading
echo "📋 Testing environment variables..."
node -r dotenv/config -e "
require('dotenv').config({ path: '.env.production' });
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('HTTP_PORT:', process.env.HTTP_PORT);
console.log('MONGO_PATH:', process.env.MONGO_PATH);
console.log('MONGO_DATABASE:', process.env.MONGO_DATABASE);
console.log('✅ Environment variables loaded successfully');
" || {
  echo "❌ Failed to load environment variables"
  exit 1
}

# Test basic server startup
echo "🧪 Testing basic server startup..."
timeout 10s node -r dotenv/config server.js &
SERVER_PID=$!
sleep 5
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "✅ Server starts successfully"
  kill $SERVER_PID
else
  echo "❌ Server failed to start"
  exit 1
fi

# Start with PM2
echo "🎯 Starting with PM2..."
pm2 start ecosystem.config.js --env production

echo "✅ Production server started with PM2"
echo "📊 Check status with: pm2 status"
echo "📋 Check logs with: pm2 logs" 