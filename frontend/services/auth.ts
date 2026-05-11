import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = 'http://192.168.0.103:3000';

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

  // O backend retorna { status, data: { access_token } }
  const token = data.data.access_token;

  if (Platform.OS === 'web') {
    localStorage.setItem('access_token', token);
  } else {
    await SecureStore.setItemAsync('access_token', token);
  }

  return data;
}

export async function loginEmployee(email: string, senha_func: string) {
    // Implementação similar para funcionário se o backend tiver a rota
    // Atualmente estamos focando em empresa conforme o guia
    const response = await fetch(`${API_URL}/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        senha_func,
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

export async function logout() {
  if (Platform.OS === 'web') {
    localStorage.removeItem('access_token');
  } else {
    await SecureStore.deleteItemAsync('access_token');
  }
}

export async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem('access_token');
  }
  return await SecureStore.getItemAsync('access_token');
}
