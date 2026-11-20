const mysql = require('mysql2/promise');
require('dotenv').config();

// Determine configuration: Support full DATABASE_URL or discrete credentials
const getPoolConfig = () => {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.replace(/^\//, ''),
      port: parseInt(url.port, 10) || 3306,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 15,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      dateStrings: true,
      ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } })
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'store_rating_db',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    dateStrings: true,
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } })
  };
};

const pool = mysql.createPool(getPoolConfig());

/**
 * Resilient Connection Test with retry mechanism for container bootup
 */
const testConnection = async (retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Connected to MySQL Database successfully:', process.env.DB_NAME || 'store_rating_db');
      connection.release();
      return true;
    } catch (error) {
      console.warn(`⚠️ MySQL Connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('❌ Could not establish MySQL database connection after retries.');
        return false;
      }
    }
  }
};

module.exports = {
  pool,
  testConnection
};
