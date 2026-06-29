const API_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- Iniciando Testes de Controle de Posse em Ocorrências (Occurrences Ownership Validation) ---');

  const timestamp = Date.now().toString().slice(-6);
  const cnpjCompanyA = `111222330001${timestamp.slice(-2)}`;
  const cnpjCompanyB = `444555660001${timestamp.slice(-2)}`;
  const cpfFuncA = `222333444${timestamp.slice(-2)}`;
  const cpfFuncB = `555666777${timestamp.slice(-2)}`;

  let tokenCompanyA, tokenCompanyB;
  let tokenFuncA, tokenFuncB;
  let idCompanyA, idCompanyB;
  let idFuncA, idFuncB;
  let idOccurrence1, idOccurrence2;

  try {
    // 1. Cadastrar Empresa A
    console.log('\n[1] Cadastrando Empresa A...');
    const resCompA = await fetch(`${API_URL}/company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_empresa: 'Empresa A S.A.',
        cnpj_empresa: cnpjCompanyA,
        email_empresa: `empresaA_occurrences_${timestamp}@test.com`,
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
        email_empresa: `empresaB_occurrences_${timestamp}@test.com`,
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
        email_func: `funcA_occurrences_${timestamp}@test.com`,
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
        email_func: `funcB_occurrences_${timestamp}@test.com`,
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

    // Teste 1: Funcionário A cria registro médico (Espera 201)
    console.log('\nTeste 1: Funcionário A cria registro médico');
    const t1 = await fetch(`${API_URL}/occurrences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFuncA}`
      },
      body: JSON.stringify({
        atestado_func: 'url_atestado_func_a.pdf',
        ocorrencias: 'Gripe e febre'
      })
    });
    console.log(`Status: ${t1.status} (Esperado: 201)`);
    const t1Body = await t1.json();
    idOccurrence1 = t1Body.data.pk_id_his_medico;
    console.log(`Registro 1 criado com ID: ${idOccurrence1}`);

    // Teste 2: Funcionário B cria registro médico (Espera 201)
    console.log('\nTeste 2: Funcionário B cria registro médico');
    const t2 = await fetch(`${API_URL}/occurrences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFuncB}`
      },
      body: JSON.stringify({
        atestado_func: 'url_atestado_func_b.pdf',
        ocorrencias: 'Dor de cabeça intensa'
      })
    });
    console.log(`Status: ${t2.status} (Esperado: 201)`);
    const t2Body = await t2.json();
    idOccurrence2 = t2Body.data.pk_id_his_medico;
    console.log(`Registro 2 criado com ID: ${idOccurrence2}`);

    // Teste 3: Empresa A tenta criar registro médico (Espera 403)
    console.log('\nTeste 3: Empresa A tenta registrar ocorrência médica');
    const t3 = await fetch(`${API_URL}/occurrences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenCompanyA}`
      },
      body: JSON.stringify({
        atestado_func: 'url_atestado_empresa.pdf',
        ocorrencias: 'Empresa criando'
      })
    });
    console.log(`Status: ${t3.status} (Esperado: 403)`);

    console.log('\n--- Executando Testes de Visualização Geral (GET /occurrences) ---');

    // Teste 4: Funcionário A lista registros (Espera apenas o seu Registro 1)
    console.log('\nTeste 4: Funcionário A lista ocorrências');
    const t4 = await fetch(`${API_URL}/occurrences`, {
      headers: { 'Authorization': `Bearer ${tokenFuncA}` }
    });
    console.log(`Status: ${t4.status} (Esperado: 200)`);
    const t4Body = await t4.json();
    const onlyFuncA = t4Body.data.every(o => o.fk_id_func === idFuncA);
    console.log(`Total registros retornados: ${t4Body.data.length}. Apenas dados de Func A? ${onlyFuncA ? 'SIM (Sucesso)' : 'NÃO (Falha)'}`);

    // Teste 5: Empresa A lista registros (Espera registros do Func A, mas nenhum do Func B)
    console.log('\nTeste 5: Empresa A lista ocorrências de seus funcionários');
    const t5 = await fetch(`${API_URL}/occurrences`, {
      headers: { 'Authorization': `Bearer ${tokenCompanyA}` }
    });
    console.log(`Status: ${t5.status} (Esperado: 200)`);
    const t5Body = await t5.json();
    const companyAFiltered = t5Body.data.every(o => o.fk_id_func === idFuncA) && t5Body.data.length > 0;
    console.log(`Total registros retornados: ${t5Body.data.length}. Apenas funcionários da Empresa A? ${companyAFiltered ? 'SIM (Sucesso)' : 'NÃO (Falha)'}`);

    console.log('\n--- Executando Testes de Visualização Individual (GET /occurrences/:id) ---');

    // Teste 6: Funcionário A vê próprio registro (Espera 200)
    console.log('\nTeste 6: Funcionário A tenta ver o Registro 1');
    const t6 = await fetch(`${API_URL}/occurrences/${idOccurrence1}`, {
      headers: { 'Authorization': `Bearer ${tokenFuncA}` }
    });
    console.log(`Status: ${t6.status} (Esperado: 200)`);

    // Teste 7: Funcionário A tenta ver registro do Funcionário B (Espera 403)
    console.log('\nTeste 7: Funcionário A tenta ver o Registro 2 (do Funcionário B)');
    const t7 = await fetch(`${API_URL}/occurrences/${idOccurrence2}`, {
      headers: { 'Authorization': `Bearer ${tokenFuncA}` }
    });
    console.log(`Status: ${t7.status} (Esperado: 403)`);

    // Teste 8: Empresa A vê registro de funcionário dela (Espera 200)
    console.log('\nTeste 8: Empresa A tenta ver o Registro 1 (de seu funcionário Func A)');
    const t8 = await fetch(`${API_URL}/occurrences/${idOccurrence1}`, {
      headers: { 'Authorization': `Bearer ${tokenCompanyA}` }
    });
    console.log(`Status: ${t8.status} (Esperado: 200)`);

    // Teste 9: Empresa A tenta ver registro de funcionário de outra empresa (Espera 403)
    console.log('\nTeste 9: Empresa A tenta ver o Registro 2 (do Func B de outra empresa)');
    const t9 = await fetch(`${API_URL}/occurrences/${idOccurrence2}`, {
      headers: { 'Authorization': `Bearer ${tokenCompanyA}` }
    });
    console.log(`Status: ${t9.status} (Esperado: 403)`);

    console.log('\n--- Executando Testes de Atualização (PATCH /occurrences/:id) ---');

    // Teste 10: Funcionário A atualiza próprio registro (Espera 200)
    console.log('\nTeste 10: Funcionário A atualiza as observações do Registro 1');
    const t10 = await fetch(`${API_URL}/occurrences/${idOccurrence1}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFuncA}`
      },
      body: JSON.stringify({ ocorrencias: 'Gripe H1N1' })
    });
    console.log(`Status: ${t10.status} (Esperado: 200)`);
    const t10Body = await t10.json();
    console.log(`Novo detalhe retornado: ${t10Body.data.ocorrencias}`);

    // Teste 11: Funcionário A tenta atualizar humor de B (Espera 403)
    console.log('\nTeste 11: Funcionário A tenta atualizar o Registro 2 (do Funcionário B)');
    const t11 = await fetch(`${API_URL}/occurrences/${idOccurrence2}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFuncA}`
      },
      body: JSON.stringify({ ocorrencias: 'Tentando hacker' })
    });
    console.log(`Status: ${t11.status} (Esperado: 403)`);

    // Teste 12: Empresa A tenta atualizar humor de A (Espera 403)
    console.log('\nTeste 12: Empresa A tenta atualizar o Registro 1 (do Funcionário A)');
    const t12 = await fetch(`${API_URL}/occurrences/${idOccurrence1}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenCompanyA}`
      },
      body: JSON.stringify({ ocorrencias: 'Empresa alterando' })
    });
    console.log(`Status: ${t12.status} (Esperado: 403)`);

    console.log('\n--- Executando Testes de Validação DTO ---');

    // Teste 13: Funcionário A tenta atualizar com texto maior que 50 caracteres (Espera 400)
    console.log('\nTeste 13: Funcionário A tenta atualizar com texto com 51 caracteres');
    const longText = 'A'.repeat(51);
    const t13 = await fetch(`${API_URL}/occurrences/${idOccurrence1}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFuncA}`
      },
      body: JSON.stringify({ ocorrencias: longText })
    });
    console.log(`Status: ${t13.status} (Esperado: 400)`);

    console.log('\n--- Executando Testes de Exclusão (DELETE /occurrences/:id) ---');

    // Teste 14: Funcionário A tenta excluir humor de B (Espera 403)
    console.log('\nTeste 14: Funcionário A tenta excluir o Registro 2 (do Funcionário B)');
    const t15 = await fetch(`${API_URL}/occurrences/${idOccurrence2}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenFuncA}` }
    });
    console.log(`Status: ${t15.status} (Esperado: 403)`);

    // Teste 15: Empresa A tenta excluir humor de A (Espera 403)
    console.log('\nTeste 15: Empresa A tenta excluir o Registro 1 (do Funcionário A)');
    const t16 = await fetch(`${API_URL}/occurrences/${idOccurrence1}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenCompanyA}` }
    });
    console.log(`Status: ${t16.status} (Esperado: 403)`);

    // Teste 16: Funcionário A exclui próprio humor (Espera 200)
    console.log('\nTeste 16: Funcionário A exclui o próprio Registro 1');
    const t17 = await fetch(`${API_URL}/occurrences/${idOccurrence1}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenFuncA}` }
    });
    console.log(`Status: ${t17.status} (Esperado: 200)`);

    console.log('\n--- Testes de Controle de Posse em Ocorrências Finalizados com Sucesso ---');

  } catch (error) {
    console.error('\n❌ Erro durante a execução dos testes:', error);
  }
}

runTests();
