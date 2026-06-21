import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_URL } from './config';

export async function loginCompany(cnpj: string, senha_empresa: string) {
  const response = await fetch(`${API_URL}/auth/company/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cnpj: cnpj.replace(/\D/g, ''),
      senha: senha_empresa,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro no login');
  }

  // O backend retorna{ status, data: { access_token } }
  const token = data.data.access_token;

  if (Platform.OS === 'web') {
    localStorage.setItem('access_token', token);
  } else {
    await SecureStore.setItemAsync('access_token', token);
  }

  return data;
}

export async function loginEmployee(cpf: string, senha_func: string) {
    const response = await fetch(`${API_URL}/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpf: cpf.replace(/\D/g, ''),
        senha: senha_func,
      }),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || 'Erro no login');
    }
  
    const token = data.data.access_token;
  
    if (Platform.OS === 'web') {
      localStorage.setItem('access_token', token);
    } else {
      await SecureStore.setItemAsync('access_token', token);
    }
  
    return data;
}
// Função para gerar token de acesso para empresas, usada no Login 
export async function generateCompanyToken(cnpj: string, senha_empresa: string) {
  const response = await fetch(`${API_URL}/auth/company/login`, {
    method: 'POST',
     headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cnpj: cnpj.replace(/\D/g, ''),
      senha: senha_empresa,
    }),
  });
  const data = await response.json();

  // Condicional para garantir que o token seja retornado mesmo que a resposta do backend seja diferente do esperado
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao gerar token');
  }

  return data.data.access_token as string;
}
// Função para gerar token de acesso para funcionários, usada no Login  
export async function generateEmployeeToken(cpf: string, senha_func: string) {
  const response = await fetch(`${API_URL}/auth/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cpf: cpf.replace(/\D/g, ''),
      senha: senha_func,
    }),
  });
  

  const data = await response.json();

  // Condicional para garantir que o token seja retornado mesmo que a resposta do backend seja diferente do esperado
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao gerar token');
  }

  return data.data.access_token as string;
}

export async function logout() {
  if (Platform.OS === 'web') {
    localStorage.removeItem('access_token');
  } else {
    await SecureStore.deleteItemAsync('access_token');
  }
}

export async function saveToken(token: string) {

  // limpa o token de espacços em branco 
  if (Platform.OS === 'web') {
    localStorage.setItem('access_token', token);
  } else {
    await SecureStore.setItemAsync('access_token', token);
  }
}

  // Obter o token de acesso para autenticação 
export async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem('access_token');
  }
  return await SecureStore.getItemAsync('access_token');
}

