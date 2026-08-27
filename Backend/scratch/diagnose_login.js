const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'COOPERA',
  password: '@batata5476',
  port: 5432,
});

async function diagnose() {
  await client.connect();
  console.log('🔗 Conectado.\n');

  // 1. Tabelas existentes
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('📋 Tabelas existentes:');
  console.log(tables.rows.map(r => r.table_name).join(', '));
  console.log();

  // 2. Roles cadastradas
  const roles = await client.query(`SELECT * FROM role;`);
  console.log('👥 Roles:');
  console.log(roles.rows);
  console.log();

  // 3. Empresas
  const companies = await client.query(`SELECT id, cnpj, nome FROM empresa LIMIT 5;`);
  console.log('🏢 Empresas:');
  console.log(companies.rows);
  console.log();

  // 4. Usuários Master
  const masters = await client.query(`
    SELECT u.id, u.nome, u.email, u.status, u.primeiro_acesso, u.empresa_id, u.role_id, r.nome as role_nome
    FROM usuario u
    LEFT JOIN role r ON u.role_id = r.id
    WHERE r.nome = 'Administrador Master' OR u.role_id IN (SELECT id FROM role WHERE nome = 'Administrador Master')
    LIMIT 5;
  `);
  console.log('👑 Usuários Administrador Master:');
  console.log(masters.rows);
  console.log();

  // 5. Teste de senha do master (CNPJ 12345678000195)
  const testCompany = await client.query(`SELECT id FROM empresa WHERE cnpj = '12345678000195';`);
  if (testCompany.rows.length > 0) {
    const cid = testCompany.rows[0].id;
    const masterUser = await client.query(`
      SELECT u.id, u.nome, u.email, u.status, u.primeiro_acesso, u.role_id, u.empresa_id, u.senha, r.nome as role_nome
      FROM usuario u
      LEFT JOIN role r ON u.role_id = r.id
      WHERE u.empresa_id = $1 AND r.nome = 'Administrador Master';
    `, [cid]);
    console.log('🔑 Usuário master para empresa CNPJ 12345678000195:');
    const user = masterUser.rows[0];
    if (user) {
      console.log({
        id: user.id,
        nome: user.nome,
        email: user.email,
        status: user.status,
        primeiro_acesso: user.primeiro_acesso,
        role_nome: user.role_nome,
        tem_senha: !!user.senha,
        senha_hash: user.senha?.substring(0, 10) + '...',
      });
    } else {
      console.log('❌ Nenhum usuário master encontrado!');
    }
  }
  console.log();

  // 6. Tabela usuario_permissao
  const tabExists = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'usuario_permissao'
    );
  `);
  console.log('🔐 Tabela usuario_permissao existe?', tabExists.rows[0].exists);

  if (tabExists.rows[0].exists) {
    const permCount = await client.query(`SELECT COUNT(*) FROM usuario_permissao;`);
    console.log('   Registros em usuario_permissao:', permCount.rows[0].count);
  }
  console.log();

  // 7. Verificar colunas do usuario
  const cols = await client.query(`
    SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'usuario'
    ORDER BY ordinal_position;
  `);
  console.log('📊 Colunas da tabela usuario:');
  cols.rows.forEach(c => {
    console.log(`  ${c.column_name} (${c.data_type}${c.character_maximum_length ? '(' + c.character_maximum_length + ')' : ''}) nullable=${c.is_nullable}`);
  });

  await client.end();
}

diagnose().catch(e => { console.error(e); client.end(); });
