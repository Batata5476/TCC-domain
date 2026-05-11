const { Client } = require('pg');

async function checkSectors() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'COOPERA',
    password: '@batata5476',
    port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM setor');
    console.log('Sectors:', JSON.stringify(res.rows, null, 2));
    const resCargo = await client.query('SELECT * FROM cargo');
    console.log('Cargos:', JSON.stringify(resCargo.rows, null, 2));
  } catch (err) {
    console.error('Error checking sectors:', err);
  } finally {
    await client.end();
  }
}

checkSectors();
