async function runTests() {
  console.log('🏁 Iniciando testes do novo fluxo de autenticação (usando native fetch)...\n');
  const baseUrl = 'http://localhost:3000';

  // Helper para chamadas POST
  async function postJson(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node-Fetch-Test'
      },
      body: JSON.stringify(data)
    });
    const isOk = res.ok;
    const body = await res.json();
    return { status: res.status, ok: isOk, body };
  }

  // 1. Teste Login da Empresa
  try {
    console.log('🔄 Testando login de empresa (CNPJ)...');
    const { status, ok, body } = await postJson(`${baseUrl}/auth/login`, {
      login: '12345678000195',
      senha: 'Teste@123'
    });

    if (ok) {
      console.log('✅ Login de Empresa bem-sucedido!');
      console.log('   Mensagem:', body.message);
      console.log('   Tipo de Usuário:', body.data.type);
      console.log('   Role do Token:', body.data.user.role);
      console.log('   Permissões:', body.data.user.permissions);
      console.log('   Token JWT:', body.data.access_token.substring(0, 30) + '...\n');
    } else {
      console.error('❌ Falha no login de empresa:', body);
    }
  } catch (err) {
    console.error('❌ Erro de requisição:', err.message);
  }

  // 2. Teste Login do Funcionário antes de ativar (deve falhar e pedir primeiro acesso)
  try {
    console.log('🔄 Testando login de funcionário pendente (antes de ativar)...');
    const { status, ok, body } = await postJson(`${baseUrl}/auth/login`, {
      login: '12345678901',
      senha: 'QualquerSenha123'
    });

    if (!ok && body.message === 'PRIMEIRO_ACESSO_REQUERIDO') {
      console.log('✅ Sucesso: O backend rejeitou o login com "PRIMEIRO_ACESSO_REQUERIDO" conforme o esperado!\n');
    } else {
      console.error('❌ Erro inesperado ao tentar logar funcionário não ativado:', body);
    }
  } catch (err) {
    console.error('❌ Erro de requisição:', err.message);
  }

  // 3. Teste Validação do Código e Token de primeiro acesso
  try {
    console.log('🔄 Testando validação de primeiro acesso...');
    const { status, ok, body } = await postJson(`${baseUrl}/auth/first-access/validate`, {
      activation_code: 'TESTE001',
      token: 'ABCD1234'
    });

    if (ok) {
      console.log('✅ Validação bem-sucedida!');
      console.log('   Mensagem:', body.message + '\n');
    } else {
      console.error('❌ Falha na validação de primeiro acesso:', body);
    }
  } catch (err) {
    console.error('❌ Erro de requisição:', err.message);
  }

  // 4. Teste Ativação de primeiro acesso (criação da senha definitiva)
  try {
    console.log('🔄 Testando ativação de conta (cadastro de senha definitiva)...');
    const { status, ok, body } = await postJson(`${baseUrl}/auth/first-access/activate`, {
      activation_code: 'TESTE001',
      token: 'ABCD1234',
      senha: 'NovaSenha@2026'
    });

    if (ok) {
      console.log('✅ Ativação de conta bem-sucedida!');
      console.log('   Mensagem:', body.message);
      console.log('   Tipo de Usuário:', body.data.type);
      console.log('   User:', body.data.user.nome);
      console.log('   Token JWT Gerado:', body.data.access_token.substring(0, 30) + '...\n');
    } else {
      console.error('❌ Falha na ativação de primeiro acesso:', body);
    }
  } catch (err) {
    console.error('❌ Erro de requisição:', err.message);
  }

  // 5. Teste Login normal do Funcionário com a senha definitiva
  try {
    console.log('🔄 Testando login de funcionário normal após ativação...');
    const { status, ok, body } = await postJson(`${baseUrl}/auth/login`, {
      login: '12345678901',
      senha: 'NovaSenha@2026'
    });

    if (ok) {
      console.log('✅ Login de Funcionário ativado bem-sucedido!');
      console.log('   Mensagem:', body.message);
      console.log('   Tipo de Usuário:', body.data.type);
      console.log('   User:', body.data.user.nome);
      console.log('   Role:', body.data.user.role);
      console.log('   Permissões:', body.data.user.permissions);
      console.log('   Token JWT:', body.data.access_token.substring(0, 30) + '...\n');
    } else {
      console.error('❌ Falha no login de funcionário ativado:', body);
    }
  } catch (err) {
    console.error('❌ Erro de requisição:', err.message);
  }

  console.log('🏁 Testes finalizados!');
}

runTests();
