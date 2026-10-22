// Automated script to create MySQL database, tables, and seed data
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  console.log('🔄 Initializing MySQL Database setup...');
  
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'phc_portal';

  let connection;
  try {
    // 1. Connect to MySQL server (without selecting a specific database first)
    connection = await mysql.createConnection({ host, user, password });
    console.log(`✅ Connected to MySQL server at ${host}`);

    // 2. Create Database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    console.log(`✅ Database '${database}' created or verified.`);

    // 3. Switch to phc_portal database
    await connection.query(`USE \`${database}\`;`);

    // 4. Read schema.sql and seed.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, '../schema/schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, '../schema/seed.sql'), 'utf8');

    // Filter out USE phc_portal and CREATE DATABASE statements from SQL files
    const cleanSchemaSql = schemaSql
      .replace(/CREATE DATABASE IF NOT EXISTS phc_portal;/gi, '')
      .replace(/USE phc_portal;/gi, '');

    const cleanSeedSql = seedSql
      .replace(/USE phc_portal;/gi, '');

    // Split and execute schema statements
    const schemaStatements = cleanSchemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of schemaStatements) {
      await connection.query(stmt);
    }
    console.log('✅ All MySQL database tables created successfully.');

    // Split and execute seed statements
    const seedStatements = cleanSeedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of seedStatements) {
      try {
        await connection.query(stmt);
      } catch (seedErr) {
        // Ignore duplicate entry errors during re-seeding
        if (!seedErr.message.includes('ER_DUP_ENTRY')) {
          console.warn('Seed note:', seedErr.message);
        }
      }
    }
    console.log('✅ Seed data inserted successfully!');
    console.log('🎉 MySQL setup complete. You can now use your MySQL database.');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
