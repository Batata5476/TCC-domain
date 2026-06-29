const API_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- Iniciando Testes de Controle de Posse em Wellbeing (Wellbeing Ownership Validation) ---');

  const timestamp = Date.now().toString().slice(-6);
  const cnpjCompanyA = `111222330001${timestamp.slice(-2)}`;
  const cnpjCompanyB = `444555660001${timestamp.slice(-2)}`;
  const cpfFuncA = `222333444${timestamp.slice(-2)}`;
  const cpfFuncB = `555666777${timestamp.slice(-2)}`;

  let tokenCompanyA, tokenCompanyB;
  let tokenFuncA, tokenFuncB;
  let idCompanyA, idCompanyB;
  let idFuncA, idFuncB;
  let idWellbeing1, idWellbeing2;

  try {
    // 1. Cadastrar Empresa A
    console.log('\n[1] Cadastrando Empresa A...');
    const resCompA = await fetch(`${API_URL}/company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_empresa: 'Empresa A S.A.',
        cnpj_empresa: cnpjCompanyA,
        email_empresa: `empresaA_wellbeing_${timestamp}@test.com`,
        tipo_empresa: 'Serviços',
        senha_empresa: 'senha123',
      }),
    });
    const dataCompA = await resCompA.json();
    if (!resCompA.ok) throw new Error(`Falha ao cadastrar Empresa A: ${JSON.stringify(dataCompA)}`);
    idCompanyA = dataCompA.data.pk_cod_empresa;
    console.log(`Empresa A cadastrada com ID: ${idCompanyA}`);

    // 2. Cadastrar Empresa B
    console.log('[2] Cadastrando Empresa B...');
    const resCompB = await fetch(`${API_URL}/company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_empresa: 'Empresa B S.A.',
        cnpj_empresa: cnpjCompanyB,
        email_empresa: `empresaB_wellbeing_${timestamp}@test.com`,
        tipo_empresa: 'Serviços',
        senha_empresa: 'senha123',
      }),
    });
    const dataCompB = await resCompB.json();
    if (!resCompB.ok) throw new Error(`Falha ao cadastrar Empresa B: ${JSON.stringify(dataCompB)}`);
    idCompanyB = dataCompB.data.pk_cod_empresa;
    console.log(`Empresa B cadastrada com ID: ${idCompanyB}`);

    // 3. Login Empresa A
    console.log('[3] Login Empresa A...');
    const resLoginCompA = await fetch(`${API_URL}/auth/company/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj: cnpjCompanyA, senha: 'senha123' }),
    });
    const dataLoginCompA = await resLoginCompA.json();
    tokenCompanyA = dataLoginCompA.data.access_token;
    console.log('Login Empresa A OK.');

    // 4. Login Empresa B
    console.log('[4] Login Empresa B...');
    const resLoginCompB = await fetch(`${API_URL}/auth/company/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj: cnpjCompanyB, senha: 'senha123' }),
    });
    const dataLoginCompB = await resLoginCompB.json();
    tokenCompanyB = dataLoginCompB.data.access_token;
    console.log('Login Empresa B OK.');

    // 5. Cadastrar Funcionário A (na Empresa A)
    console.log('[5] Cadastrando Funcionário A (Empresa A)...');
    const resFuncA = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_func: 'Funcionário A (Empresa A)',
        cpf_func: cpfFuncA,
        email_func: `funcA_wellbeing_${timestamp}@test.com`,
        senha_func: 'senha123',
        fk_cod_empresa: idCompanyA,
        fk_id_setor: 1,
        fk_id_cargo: 1,
      }),
    });
    const dataFuncA = await resFuncA.json();
    idFuncA = dataFuncA.data.pk_id_func;
    console.log(`Funcionário A cadastrado com ID: ${idFuncA}`);

    // 6. Cadastrar Funcionário B (na Empresa B)
    console.log('[6] Cadastrando Funcionário B (Empresa B)...');
    const resFuncB = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_func: 'Funcionário B (Empresa B)',
        cpf_func: cpfFuncB,
        email_func: `funcB_wellbeing_${timestamp}@test.com`,
        senha_func: 'senha123',
        fk_cod_empresa: idCompanyB,
        fk_id_setor: 1,
        fk_id_cargo: 1,
      }),
    });
    const dataFuncB = await resFuncB.json();
    idFuncB = dataFuncB.data.pk_id_func;
    console.log(`Funcionário B cadastrado com ID: ${idFuncB}`);

    // 7. Login Funcionário A
    console.log('[7] Login Funcionário A...');
    const resLoginFuncA = await fetch(`${API_URL}/auth/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: cpfFuncA, senha: 'senha123' }),
    });
    const dataLoginFuncA = await resLoginFuncA.json();
    tokenFuncA = dataLoginFuncA.data.access_token;
    console.log('Login Funcionário A OK.');

    // 8. Login Funcionário B
    console.log('[8] Login Funcionário B...');
    const resLoginFuncB = await fetch(`${API_URL}/auth/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: cpfFuncB, senha: 'senha123' }),
    });
    const dataLoginFuncB = await resLoginFuncB.json();
    tokenFuncB = dataLoginFuncB.data.access_token;
    console.log('Login Funcionário B OK.');

    console.log('\n--- Executando Testes de Criação ---');

    // Teste 1: Funcionário A cria registro de humor (Espera 201)
    console.log('\nTeste 1: Funcionário A cria registro de humor com nota 4');
    const t1 = await fetch(`${API_URL}/wellbeing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFuncA}`
      },
      body: JSON.stringify({ humor_func: 4 })
    });
    console.log(`Status: ${t1.status} (Esperado: 201)`);
    const t1Body = await t1.json();
    idWellbeing1 = t1Body.data.pk_id_humor;
    console.log(`Registro 1 criado com ID: ${idWellbeing1}`);

    // Teste 2: Funcionário A tenta criar registro de humor novamente no mesmo dia (Espera 409 Conflict - Limite 1 por dia)
    console.log('\nTeste 2: Funcionário A tenta registrar humor novamente no mesmo dia');
    const t2 = await fetch(`${API_URL}/wellbeing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFuncA}`
      },
      body: JSON.stringify({ humor_func: 5 })
    });
    console.log(`Status: ${t2.status} (Esperado: 409)`);
    const t2Body = await t2.json();
    console.log(`Resposta: ${JSON.stringify(t2Body)}`);

    // Teste 3: Funcionário B cria seu único registro do dia (Espera 201)
    console.log('\nTeste 3: Funcionário B cria registro de humor com nota 3');
    const t3 = await fetch(`${API_URL}/wellbeing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFuncB}`
      },
      body: JSON.stringify({ humor_func: 3 })
    });
    console.log(`Status: ${t3.status} (Esperado: 201)`);
    const t3Body = await t3.json();
    idWellbeing2 = t3Body.data.pk_id_humor;
    console.log(`Registro 2 criado com ID: ${idWellbeing2}`);

    // Teste 4: Empresa A tenta criar registro de humor (Espera 403)
    console.log('\nTeste 4: Empresa A tenta registrar humor');
    const t4 = await fetch(`${API_URL}/wellbeing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenCompanyA}`
      },
      body: JSON.stringify({ humor_func: 5 })
    });
    console.log(`Status: ${t4.status} (Esperado: 403)`);

    console.log('\n--- Executando Testes de Escrita Removida (PATCH / DELETE) ---');

    // Teste 5: Funcionário A tenta alterar o Registro 1 (Espera 404 Not Found - Rota deletada)
    console.log('\nTeste 5: Funcionário A tenta enviar PATCH /wellbeing/:id');
    const t5 = await fetch(`${API_URL}/wellbeing/${idWellbeing1}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFuncA}`
      },
      body: JSON.stringify({ humor_func: 5 })
    });
    console.log(`Status: ${t5.status} (Esperado: 404)`);

    // Teste 6: Funcionário A tenta excluir o Registro 1 (Espera 404 Not Found - Rota deletada)
    console.log('\nTeste 6: Funcionário A tenta enviar DELETE /wellbeing/:id');
    const t6 = await fetch(`${API_URL}/wellbeing/${idWellbeing1}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenFuncA}` }
    });
    console.log(`Status: ${t6.status} (Esperado: 404)`);

    console.log('\n--- Executando Testes de Visualização Geral (GET /wellbeing) ---');

    // Teste 7: Funcionário A lista registros (Espera apenas o seu Registro 1)
    console.log('\nTeste 7: Funcionário A lista todos os humores');
    const t7 = await fetch(`${API_URL}/wellbeing`, {
      headers: { 'Authorization': `Bearer ${tokenFuncA}` }
    });
    console.log(`Status: ${t7.status} (Esperado: 200)`);
    const t7Body = await t7.json();
    const onlyFuncA = t7Body.data.every(h => h.fk_id_func === idFuncA);
    console.log(`Total registros retornados: ${t7Body.data.length}. Apenas dados de Func A? ${onlyFuncA ? 'SIM (Sucesso)' : 'NÃO (Falha)'}`);

    // Teste 8: Empresa A lista registros (Espera registros do Func A, mas nenhum do Func B)
    console.log('\nTeste 8: Empresa A lista todos os humores da empresa (últimos 30 dias)');
    const t8 = await fetch(`${API_URL}/wellbeing`, {
      headers: { 'Authorization': `Bearer ${tokenCompanyA}` }
    });
    console.log(`Status: ${t8.status} (Esperado: 200)`);
    const t8Body = await t8.json();
    const companyAFiltered = t8Body.data.every(h => h.fk_id_func === idFuncA) && t8Body.data.length > 0;
    console.log(`Total registros retornados: ${t8Body.data.length}. Apenas funcionários da Empresa A? ${companyAFiltered ? 'SIM (Sucesso)' : 'NÃO (Falha)'}`);

    console.log('\n--- Executando Testes de Visualização Individual (GET /wellbeing/:id) ---');

    // Teste 9: Funcionário A vê próprio registro (Espera 200)
    console.log('\nTeste 9: Funcionário A tenta ver o Registro 1');
    const t9 = await fetch(`${API_URL}/wellbeing/${idWellbeing1}`, {
      headers: { 'Authorization': `Bearer ${tokenFuncA}` }
    });
    console.log(`Status: ${t9.status} (Esperado: 200)`);

    // Teste 10: Funcionário A tenta ver registro do Funcionário B (Espera 403)
    console.log('\nTeste 10: Funcionário A tenta ver o Registro 2 (do Funcionário B)');
    const t10 = await fetch(`${API_URL}/wellbeing/${idWellbeing2}`, {
      headers: { 'Authorization': `Bearer ${tokenFuncA}` }
    });
    console.log(`Status: ${t10.status} (Esperado: 403)`);

    // Teste 11: Empresa A vê registro de funcionário dela (Espera 200)
    console.log('\nTeste 11: Empresa A tenta ver o Registro 1 (de seu funcionário Func A)');
    const t11 = await fetch(`${API_URL}/wellbeing/${idWellbeing1}`, {
      headers: { 'Authorization': `Bearer ${tokenCompanyA}` }
    });
    console.log(`Status: ${t11.status} (Esperado: 200)`);

    // Teste 12: Empresa A tenta ver registro de funcionário de outra empresa (Espera 403)
    console.log('\nTeste 12: Empresa A tenta ver o Registro 2 (do Func B de outra empresa)');
    const t12 = await fetch(`${API_URL}/wellbeing/${idWellbeing2}`, {
      headers: { 'Authorization': `Bearer ${tokenCompanyA}` }
    });
    console.log(`Status: ${t12.status} (Esperado: 403)`);

    console.log('\n--- Testes de Controle de Posse em Wellbeing Finalizados com Sucesso ---');

  } catch (error) {
    console.error('\n❌ Erro durante a execução dos testes:', error);
  }
}

runTests();
