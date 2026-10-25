import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl(): string {
  // 1. No navegador (Web), usa sempre o mesmo hostname da barra de endereços (localhost ou IP da máquina)
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:3000`;
  }

  // 2. Se foi definido explicitamente no .env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 3. No Expo Go / celular físico, hostUri traz o IP do computador na rede local (ex: 192.168.0.107:8081)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }

  // 4. Fallback para o IP local atual deste computador
  return 'http://192.168.0.107:3000';
}

export const API_URL = resolveApiUrl();
