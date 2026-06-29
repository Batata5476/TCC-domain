/**
 * SEED DE DADOS PARA TESTES
 * ─────────────────────────────────────────────────────────────────────────────
 * Empresa de teste:
 *   CNPJ      : 12345678000195
 *   Login     : 12345678000195
 *   Senha     : Teste@123
 *
 * Funcionário de teste (usa primeiro acesso):
 *   Código de Ativação: TESTE001
 *   Token             : ABCD1234
 *   CPF               : 12345678901
 *   E-mail            : funcionario@teste.com
 *   Setor             : TI
 *   Cargo             : Desenvolvedor
 *   (Crie a senha no primeiro acesso usando os dados acima)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function seed() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'COOPERA',
    password: '@batata5476',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao banco de dados.');
    await client.query('BEGIN');

    // ── 1. Empresa de teste ───────────────────────────────────────────────────
    const cnpj = '12345678000195';

    // Verifica se já existe
    const existingCompany = await client.query(
      `SELECT id FROM empresa WHERE cnpj = $1;`,
      [cnpj]
    );

    let companyId;
    if (existingCompany.rows.length > 0) {
      companyId = existingCompany.rows[0].id;
      console.log(`ℹ️  Empresa de teste já existe (ID: ${companyId}). Pulando criação.`);
    } else {
      const companyResult = await client.query(
        `INSERT INTO empresa (cnpj, nome, email, tipo_empresa)
         VALUES ($1, $2, $3, $4) RETURNING id;`,
        [cnpj, 'Empresa Teste Coopera', 'empresa@teste.com', 'Tecnologia']
      );
      companyId = companyResult.rows[0].id;
      console.log(`✅ Empresa criada (ID: ${companyId})`);
    }

    // ── 2. Setor para a empresa ───────────────────────────────────────────────
    const setorResult = await client.query(
      `SELECT id FROM setor WHERE empresa_id = $1 AND nome = 'TI';`,
      [companyId]
    );

    let setorId;
    if (setorResult.rows.length > 0) {
      setorId = setorResult.rows[0].id;
      console.log(`ℹ️  Setor TI já existe (ID: ${setorId}).`);
    } else {
      const newSetor = await client.query(
        `INSERT INTO setor (empresa_id, nome) VALUES ($1, 'TI') RETURNING id;`,
        [companyId]
      );
      setorId = newSetor.rows[0].id;
      console.log(`✅ Setor TI criado (ID: ${setorId})`);
    }

    // ── 3. Roles ──────────────────────────────────────────────────────────────
    const adminRoleResult = await client.query(
      `SELECT id FROM role WHERE nome = 'Administrador Master';`
    );
    const employeeRoleResult = await client.query(
      `SELECT id FROM role WHERE nome = 'Funcionário';`
    );

    if (adminRoleResult.rows.length === 0 || employeeRoleResult.rows.length === 0) {
      console.error('❌ Roles não encontradas. Execute a migração primeiro (migrate_db.js).');
      process.exit(1);
    }

    const adminRoleId = adminRoleResult.rows[0].id;
    const employeeRoleId = employeeRoleResult.rows[0].id;

    // ── 4. Usuário Master (Admin) ─────────────────────────────────────────────
    const masterCpf = String(10000000000 + companyId);
    const masterEmail = 'empresa@teste.com';
    const masterSenhaHash = await bcrypt.hash('Teste@123', 10);

    const existingMaster = await client.query(
      `SELECT id FROM usuario WHERE empresa_id = $1 AND role_id = $2;`,
      [companyId, adminRoleId]
    );

    let masterId;
    if (existingMaster.rows.length > 0) {
      masterId = existingMaster.rows[0].id;
      // Atualiza a senha para garantir que o hash está correto
      await client.query(
        `UPDATE usuario SET senha = $1 WHERE id = $2;`,
        [masterSenhaHash, masterId]
      );
      console.log(`ℹ️  Usuário Master já existe (ID: ${masterId}). Senha atualizada.`);
    } else {
      const masterResult = await client.query(
        `INSERT INTO usuario 
         (empresa_id, role_id, setor_id, nome, email, cpf, senha, cargo, status, primeiro_acesso)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', false)
         RETURNING id;`,
        [companyId, adminRoleId, setorId, 'Admin Teste', masterEmail, masterCpf, masterSenhaHash, 'Administrador Master']
      );
      masterId = masterResult.rows[0].id;
      console.log(`✅ Usuário Master criado (ID: ${masterId})`);
    }

    // ── 5. Funcionário de teste (primeiro acesso) ─────────────────────────────
    const funcCpf = '12345678901';
    const funcEmail = 'funcionario@teste.com';
    const activationCode = 'TESTE001';
    const rawToken = 'ABCD1234';
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const tokenExpiracao = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
    const tempSenhaHash = await bcrypt.hash('TmpSeed@0', 10);

    const existingFunc = await client.query(
      `SELECT id FROM usuario WHERE cpf = $1;`,
      [funcCpf]
    );

    let funcId;
    if (existingFunc.rows.length > 0) {
      funcId = existingFunc.rows[0].id;
      // Reseta o estado de primeiro acesso para poder testar novamente
      await client.query(
        `UPDATE usuario SET
           activation_code = $1,
           token = $2,
           token_expiracao = $3,
           primeiro_acesso = true,
           status = 'PENDING'
         WHERE id = $4;`,
        [activationCode, tokenHash, tokenExpiracao, funcId]
      );
      console.log(`ℹ️  Funcionário de teste já existe (ID: ${funcId}). Estado de primeiro acesso resetado.`);
    } else {
      const funcResult = await client.query(
        `INSERT INTO usuario
         (empresa_id, role_id, setor_id, nome, email, cpf, senha, cargo, status, primeiro_acesso, activation_code, token, token_expiracao)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', true, $9, $10, $11)
         RETURNING id;`,
        [companyId, employeeRoleId, setorId, 'João Funcionário', funcEmail, funcCpf, tempSenhaHash, 'Desenvolvedor', activationCode, tokenHash, tokenExpiracao]
      );
      funcId = funcResult.rows[0].id;
      console.log(`✅ Funcionário de teste criado (ID: ${funcId})`);
    }

    await client.query('COMMIT');

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  SEED CONCLUÍDO — DADOS PARA TESTE');
    console.log('════════════════════════════════════════════════════════════');
    console.log('\n🏢 EMPRESA (Administrador Master):');
    console.log(`   Login (CNPJ) : ${cnpj}`);
    console.log(`   Senha        : Teste@123`);
    console.log(`   E-mail       : ${masterEmail}`);
    console.log('\n👤 FUNCIONÁRIO (Primeiro Acesso):');
    console.log(`   CPF          : ${funcCpf}`);
    console.log(`   E-mail       : ${funcEmail}`);
    console.log(`   Código       : ${activationCode}`);
    console.log(`   Token        : ${rawToken}`);
    console.log(`   (Use o código e token acima para criar a senha no app)`);
    console.log('════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Erro no seed, revertendo...', err);
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
}

seed();
