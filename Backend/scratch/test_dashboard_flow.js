async function testDashboard() {
  const base = 'http://localhost:3000';

  // Step 1: login
  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: '12345678000195', senha: 'Teste@123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.access_token;
  console.log('🔑 Token obtido:', token ? 'SIM' : 'NÃO');
  console.log('   type retornado:', loginData.data?.type);
  console.log('   sub (user_id):', loginData.data?.user?.id, '\n');

  if (!token) { console.log('❌ Login falhou'); return; }

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // Step 2: testa /dashboard/user (qual status retorna?)
  const userDashRes = await fetch(`${base}/dashboard/user`, { headers });
  const userDashData = await userDashRes.json();
  console.log(`📊 GET /dashboard/user → status ${userDashRes.status}`);
  console.log('   Body:', JSON.stringify(userDashData, null, 2).substring(0, 300));
  console.log();

  // Step 3: testa /dashboard/company
  const compDashRes = await fetch(`${base}/dashboard/company`, { headers });
  const compDashData = await compDashRes.json();
  console.log(`🏢 GET /dashboard/company → status ${compDashRes.status}`);
  console.log('   Body:', JSON.stringify(compDashData, null, 2).substring(0, 300));
  console.log();

  // Step 4: testa /users (lista de funcionários)
  const usersRes = await fetch(`${base}/users`, { headers });
  const usersData = await usersRes.json();
  console.log(`👥 GET /users → status ${usersRes.status}`);
  console.log('   Body:', JSON.stringify(usersData, null, 2).substring(0, 400));
}

testDashboard().catch(e => console.error('Erro:', e.message));
