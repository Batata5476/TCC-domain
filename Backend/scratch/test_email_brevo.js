const fs = require('fs');
const path = require('path');

// Ler o .env manualmente
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const clean = line.trim();
  if (clean && !clean.startsWith('#')) {
    const idx = clean.indexOf('=');
    if (idx !== -1) {
      const key = clean.substring(0, idx).trim();
      const val = clean.substring(idx + 1).trim();
      env[key] = val;
    }
  }
});

const apiKey = env['BREVO_API_KEY'];
const senderEmail = env['BREVO_SENDER_EMAIL'];
const senderName = env['BREVO_SENDER_NAME'] || 'Sistema Coopera';
const targetEmail = 'pedro.yuuki96@gmail.com';

console.log('--- TESTANDO DISPARO VIA BREVO ---');
console.log('Remetente:', `${senderName} <${senderEmail}>`);
console.log('Destinatário:', targetEmail);
console.log('API Key presente?', !!apiKey, apiKey ? apiKey.substring(0, 15) + '...' : '');

async function runTest() {
  const code = 'TEST-2026';
  const rawToken = 'TOK-8899AA';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #285A71;">Teste de Integração - Sistema Coopera</h2>
      <p>Olá, Pedro! Se você está lendo isso, a sua integração com a API do <strong>Brevo</strong> funcionou 100% com sucesso!</p>

      <div style="background-color: #f3f6f8; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 6px 0;"><strong>Código de Teste:</strong> <span style="font-size: 18px; color: #285A71; font-weight: bold;">${code}</span></p>
        <p style="margin: 6px 0;"><strong>Token de Teste:</strong> <span style="font-size: 18px; color: #285A71; font-weight: bold;">${rawToken}</span></p>
      </div>

      <p style="color: #2e7d32; font-weight: bold;">Integração do TCC finalizada com sucesso via API REST!</p>
      <p style="color: #777; font-size: 12px;">Enviado em: ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: targetEmail, name: 'Pedro' }],
        subject: '🚀 Teste de Integração de E-mail - Sistema Coopera',
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCESSO! E-mail disparado pela Brevo!');
      console.log('Message ID retornado pela Brevo:', data.messageId);
    } else {
      console.error('\n❌ ERRO retornado pela API da Brevo:');
      console.error(data);
    }
  } catch (error) {
    console.error('\n❌ Erro de rede/requisição:', error.message);
  }
}

runTest();
