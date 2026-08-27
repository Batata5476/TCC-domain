import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_URL } from './config';

// ─── Token Storage ────────────────────────────────────────────────────────────

export async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem('access_token', token);
  } else {
    await SecureStore.setItemAsync('access_token', token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem('access_token');
  }
  return SecureStore.getItemAsync('access_token');
}

export async function saveUserType(type: 'company' | 'user') {
  if (Platform.OS === 'web') {
    localStorage.setItem('user_type', type);
  } else {
    await SecureStore.setItemAsync('user_type', type);
  }
}

export async function getUserType(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem('user_type');
  }
  return SecureStore.getItemAsync('user_type');
}

export async function logout() {
  if (Platform.OS === 'web') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
  } else {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('user_type');
  }
}

// ─── Unified Login (CNPJ / CPF / Email) ──────────────────────────────────────

export interface LoginResult {
  access_token: string;
  type: 'company' | 'user';
  user: {
    id: number;
    nome: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export async function login(login: string, senha: string): Promise<LoginResult> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, senha }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Backend retorna 'PRIMEIRO_ACESSO_REQUERIDO' no message quando a conta precisa ser ativada
    throw new Error(data.message || 'Erro no login');
  }

  const token = data.data.access_token;
  await saveToken(token);

  // Persiste o tipo de sessão para uso no dashboard
  const sessionType = data.data.type as 'company' | 'user';
  await saveUserType(sessionType);

  return data.data as LoginResult;
}

// ─── First Access ─────────────────────────────────────────────────────────────

export async function validateFirstAccess(activation_code: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/first-access/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activation_code, token }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Código ou token inválido');
  }
}

export async function activateFirstAccess(
  activation_code: string,
  token: string,
  senha: string,
): Promise<LoginResult> {
  const response = await fetch(`${API_URL}/auth/first-access/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activation_code, token, senha }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao ativar conta');
  }

  const accessToken = data.data.access_token;
  await saveToken(accessToken);

  return data.data as LoginResult;
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao solicitar redefinição');
  }
}
