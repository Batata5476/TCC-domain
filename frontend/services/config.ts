import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl(): string {
  // 1. Se foi definido explicitamente via variável de ambiente (ex: Vercel / produção ou celular físico)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // 2. No navegador (Web) em ambiente local, usa o mesmo hostname na porta 3000
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.');

    if (isLocal) {
      return `http://${host}:3000`;
    }
    return window.location.origin;
  }

  // 3. No Expo Go / celular físico, hostUri traz o IP do computador na rede local (ex: 192.168.0.107:8081)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }

  // 4. Fallback local
  return 'http://localhost:3000';
}

export const API_URL = resolveApiUrl();
