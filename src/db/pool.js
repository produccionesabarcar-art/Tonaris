const { Pool } = require('pg');
const logger = require('../lib/logger');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  logger.error(err, '[DB] Error inesperado en el pool');
});

module.exports = pool;