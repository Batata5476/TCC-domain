const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '@batata5476',
    port: 5432,
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE "COOPERA"');
    console.log('Database COOPERA created successfully');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database COOPERA already exists');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await client.end();
  }
}

createDb();
