import { getToken } from './auth';

const API_URL = 'http://192.168.0.103:3000';

export async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Poderia tratar logout automático aqui
    console.warn('Sessão expirada ou não autorizada');
  }

  return response;
}
