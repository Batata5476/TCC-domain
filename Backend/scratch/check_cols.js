const { Client } = require('pg');
const client = new Client({user:'postgres',host:'localhost',database:'COOPERA',password:'@batata5476',port:5432});
client.connect()
  .then(() => client.query(`SELECT column_name, character_maximum_length, data_type FROM information_schema.columns WHERE table_name='usuario' AND column_name IN ('token','activation_code','cpf','senha')`))
  .then(r => { console.log(r.rows); client.end(); })
  .catch(e => { console.error(e); client.end(); });
