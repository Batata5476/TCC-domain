const { Client } = require('pg');
const client = new Client({user:'postgres',host:'localhost',database:'COOPERA',password:'@batata5476',port:5432});
client.connect()
  .then(() => client.query(`SELECT id, nome, status, primeiro_acesso, activation_code, token, token_expiracao FROM usuario WHERE activation_code = 'TESTE001'`))
  .then(r => { console.log(r.rows); client.end(); })
  .catch(e => { console.error(e); client.end(); });
