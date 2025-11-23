# Install PM2
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process
pm2 save

# Setup PM2 startup
pm2 startup

# Monitor
pm2 monit