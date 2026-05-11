const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function seedDb() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'COOPERA',
    password: '@batata5476',
    port: 5432,
  });

  try {
    await client.connect();
    
    // Read the SQL files
    const cooperaSql = fs.readFileSync(path.join(__dirname, '..', 'BD', 'coopera.sql'), 'utf8');
    const dadosSql = fs.readFileSync(path.join(__dirname, '..', 'BD', 'dadosdeteste.sql'), 'utf8');

    console.log('Applying coopera.sql...');
    // We skip the CREATE DATABASE because we already did it
    const schemaSql = cooperaSql.replace('CREATE DATABASE COOPERA;', '');
    await client.query(schemaSql);
    
    console.log('Applying dadosdeteste.sql...');
    await client.query(dadosSql);

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.end();
  }
}

seedDb();
