async function testHTTP() {
  const base = 'http://localhost:3000';

  console.log('🔄 Testando /auth/login com CNPJ...\n');

  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: '12345678000195', senha: 'Teste@123' }),
  });

  const body = await res.json();
  console.log('Status HTTP:', res.status);
  console.log('Resposta completa:', JSON.stringify(body, null, 2));
}

testHTTP().catch(e => console.error('Erro de requisição:', e.message));
