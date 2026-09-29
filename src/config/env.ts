// Expo solo incrusta variables EXPO_PUBLIC_* cuando se leen con acceso estático
// (process.env.EXPO_PUBLIC_X), así que no se puede leer con una clave dinámica.
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    'Falta EXPO_PUBLIC_API_URL. Copia .env.example a .env, define la URL del backend ' +
      '(por ejemplo http://192.168.1.10:3000, no localhost) y reinicia con `npx expo start -c`.',
  );
}

export const env = {
  // Origen del backend, sin "/" final. Las rutas de la API llevan el prefijo /v1.
  apiUrl: apiUrl.replace(/\/+$/, ''),
} as const;
