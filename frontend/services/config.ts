import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl(): string {
  // 1. Se foi definido explicitamente no .env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. No navegador (Web), usa a mesma origem/hostname do navegador
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:3000`;
  }

  // 3. No Expo Go / celular físico, hostUri traz o IP do computador na rede local (ex: 10.0.3.13:8081)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }

  // 4. Fallback para localhost
  return 'http://localhost:3000';
}

export const API_URL = resolveApiUrl();

