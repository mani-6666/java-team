const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * PostgreSQL Connection Pool Configuration
 * Using connection pool for better performance and connection management
 */

// Configure SSL based on certificate availability
let sslConfig;

// Check if SSL certificate paths are provided
const sslCaPath = process.env.DB_SSL_CA;
const sslCertPath = process.env.DB_SSL_CERT;
const sslKeyPath = process.env.DB_SSL_KEY;

if (sslCaPath && sslCertPath && sslKeyPath && 
    fs.existsSync(sslCaPath) && fs.existsSync(sslCertPath) && fs.existsSync(sslKeyPath)) {
  // Use certificate files for SSL connection
  console.log('🔐 Using SSL certificate files for secure connection');
  sslConfig = {
    ca: fs.readFileSync(sslCaPath).toString(),
    cert: fs.readFileSync(sslCertPath).toString(),
    key: fs.readFileSync(sslKeyPath).toString(),
    rejectUnauthorized: true, // Verify the server certificate
    servername: '15-322f05e1-3f17-4b89-85c8-f9c4c1d40cca.asia-south1.sql.goog' // SNI for GCP Cloud SQL
  };
} else {
  // Fallback to basic SSL without certificate verification
  console.log('⚠  Using SSL without certificate verification (not recommended for production)');
  sslConfig = {
    rejectUnauthorized: false
  };
}

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  // max: parseInt(process.env.DB_MAX_POOL_SIZE) || 20, // Maximum number of clients in the pool
  max: 5,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000, // How long to wait for a connection
  ssl: sslConfig
};

// Create the pool instance
const pool = new Pool(poolConfig);

// Event listeners for pool
pool.on('connect', () => {
  console.log('✅ New client connected to the pool');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('remove', () => {
  console.log('🔌 Client removed from pool');
});

module.exports = pool;