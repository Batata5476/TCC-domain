import Constants from 'expo-constants';

function resolveApiUrl(): string {
  // 1. Se foi definido explicitamente no .env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. No Expo Go / celular físico, hostUri traz o IP do computador na rede local (ex: 192.168.0.107:8081)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }

  // 3. Fallback para o IP atual deste computador
  return 'http://192.168.0.107:3000';
}

export const API_URL = resolveApiUrl();
