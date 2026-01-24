module.exports = {
  apps: [
    {
      name: 'menu-scraper-web',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'menu-scraper-cron',
      script: 'scraper.js',
      instances: 1,
      autorestart: false,
      cron_restart: '0 2 * * *', // Run at 2 AM daily
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
