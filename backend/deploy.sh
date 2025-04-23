#!/bin/bash

# Stop any running instances
echo "Stopping any running instances..."
pm2 stop ncc-compliance-backend || true
pm2 delete ncc-compliance-backend || true

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy environment file
echo "Setting up environment..."
cp .env.production .env

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
echo "Saving PM2 process list..."
pm2 save

# Display status
echo "Current PM2 status:"
pm2 status

echo "Deployment completed successfully!" 