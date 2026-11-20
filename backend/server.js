// Load environment variables from .env file before anything else
require('dotenv').config();

const app = require('./app');
const { testConnection, pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start listening for incoming network requests
const server = app.listen(PORT, async () => {
  console.log('====================================================');
  console.log(`🚀 Store Rating System Backend Server Running!`);
  console.log(`📡 Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL : http://localhost:${PORT}`);
  console.log(`🩺 Health Check : http://localhost:${PORT}/api/health`);
  console.log('====================================================');
  await testConnection();
});

// Graceful Shutdown Handler (Essential for Docker & Cloud Platforms)
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
  
  // Set timeout to force shutdown if hanging requests don't finish
  const forceExitTimeout = setTimeout(() => {
    console.error('⚠️ Forcefully terminating remaining active connections.');
    process.exit(1);
  }, 10000);

  server.close(async () => {
    console.log('🔒 Closed HTTP Server. No more incoming requests.');
    try {
      await pool.end();
      console.log('💧 MySQL connection pool drained successfully.');
      clearTimeout(forceExitTimeout);
      console.log('✅ Server terminated cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during pool draining:', err.message);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err) => {
  console.error('CRITICAL: Unhandled Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err.message);
  process.exit(1);
});
