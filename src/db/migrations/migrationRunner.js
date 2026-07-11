const fs = require('fs');
const path = require('path');
const pool = require('../pool');
const logger = require('../../lib/logger');

async function runMigrations() {
  const client = await pool.connect();

  try {
    // Crear tabla de control si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Leer archivos .sql en orden
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      // Verificar si ya corrió
      const { rows } = await client.query(
        'SELECT filename FROM migrations WHERE filename = $1',
        [file]
      );

      if (rows.length > 0) {
        logger.info(`⏭️  Ya ejecutada: ${file}`);
        continue;
      }

      // Ejecutar el SQL
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);

      // Registrar como ejecutada
      await client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [file]
      );

      logger.info(`✅ Migración ejecutada: ${file}`);
    }

    logger.info('🏁 Migraciones completadas.');
  } catch (err) {
    logger.error(err, '❌ Error en migraciones');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { runMigrations };