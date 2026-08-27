const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'COOPERA',
  password: '@batata5476',
  port: 5432,
});

async function testLogin() {
  await client.connect();

  console.log('🔄 Testando login de empresa (CNPJ: 12345678000195, Senha: Teste@123)...\n');

  // Simula exatamente o que o AuthService faz
  const cnpj = '12345678000195';
  const senha = 'Teste@123';

  // Step 1: busca empresa
  const companyRes = await client.query(`SELECT id, cnpj, nome FROM empresa WHERE cnpj = $1;`, [cnpj]);
  if (companyRes.rows.length === 0) {
    console.log('❌ Empresa não encontrada com CNPJ:', cnpj);
    await client.end();
    return;
  }
  const company = companyRes.rows[0];
  console.log('✅ Empresa encontrada:', company);

  // Step 2: busca usuário Administrador Master para essa empresa
  const userRes = await client.query(`
    SELECT u.id, u.nome, u.email, u.status, u.primeiro_acesso, u.senha, u.empresa_id, u.role_id, r.nome as role_nome
    FROM usuario u
    LEFT JOIN role r ON u.role_id = r.id
    WHERE u.empresa_id = $1 AND r.nome = 'Administrador Master';
  `, [company.id]);

  if (userRes.rows.length === 0) {
    console.log('❌ Nenhum usuário "Administrador Master" encontrado para empresa_id =', company.id);

    // Mostra todos usuários da empresa para debug
    const allUsers = await client.query(`
      SELECT u.id, u.nome, u.role_id, r.nome as role_nome
      FROM usuario u
      LEFT JOIN role r ON u.role_id = r.id
      WHERE u.empresa_id = $1;
    `, [company.id]);
    console.log('\n📋 Todos usuários da empresa:');
    console.log(allUsers.rows);
    await client.end();
    return;
  }

  const user = userRes.rows[0];
  console.log('✅ Usuário master encontrado:');
  console.log({ id: user.id, nome: user.nome, email: user.email, status: user.status, primeiro_acesso: user.primeiro_acesso, role_nome: user.role_nome });

  // Step 3: verifica status
  if (user.status === 'BLOCKED' || user.status === 'DISABLED' || user.status === 'DELETED') {
    console.log('❌ Conta bloqueada/desativada. Status:', user.status);
    await client.end();
    return;
  }

  // Step 4: verifica primeiro_acesso
  if (user.primeiro_acesso) {
    console.log('❌ primeiro_acesso = true → PRIMEIRO_ACESSO_REQUERIDO');
    await client.end();
    return;
  }

  // Step 5: compara senha
  if (!user.senha) {
    console.log('❌ Sem senha no banco (coluna senha está NULL)');
    await client.end();
    return;
  }

  const isValid = await bcrypt.compare(senha, user.senha);
  if (!isValid) {
    console.log('❌ Senha incorreta!');
    console.log('  Hash no banco:', user.senha.substring(0, 20) + '...');
    console.log('  Tentando comparar com: "' + senha + '"');
    
    // Tenta descobrir que senha funciona
    const testSenhas = ['Teste@123', 'teste@123', 'Admin@123'];
    for (const ts of testSenhas) {
      const ok = await bcrypt.compare(ts, user.senha);
      console.log(`  "${ts}" → ${ok ? '✅ CORRETA' : '❌'}`);
    }
  } else {
    console.log('✅ Senha correta! Login funcionaria com sucesso.');
  }

  // Step 6: verifica tabela role_permissao
  const rolePerms = await client.query(`
    SELECT p.nome FROM role_permissao rp
    JOIN permissao p ON rp.permissao_id = p.id
    WHERE rp.role_id = $1;
  `, [user.role_id]);
  console.log('\n🔐 Permissões da role', user.role_nome, ':', rolePerms.rows.map(r => r.nome));

  // Também verifica se a coluna na tabela role_permissao é permissao_id ou permission_id
  const rpCols = await client.query(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'role_permissao';
  `);
  console.log('\n📊 Colunas de role_permissao:', rpCols.rows.map(r => r.column_name));

  const upCols = await client.query(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'usuario_permissao';
  `);
  console.log('📊 Colunas de usuario_permissao:', upCols.rows.map(r => r.column_name));

  await client.end();
}

testLogin().catch(e => { console.error('ERRO:', e.message); client.end(); });
