const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('../../package.json').version
  });
});

const PORT = process.env.HEALTH_CHECK_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

module.exports = app;