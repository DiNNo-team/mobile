import { Stack } from 'expo-router';

import { useAuth } from '@/features/session/SessionProvider';

/**
 * Screens before the diner's area. Each one only exists in its session state, so the app always lands on the
 * right one: login without session, verification, wrong account, backend not reachable or connecting.
 */
export default function AuthLayout() {
  const { status } = useAuth();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === 'signed-out'}>
        <Stack.Screen name="login" />
        <Stack.Screen name="crear-cuenta" />
        <Stack.Screen name="recuperar-contrasena" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'email-not-verified'}>
        <Stack.Screen name="verificar-correo" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'restaurant-account'}>
        <Stack.Screen name="cuenta-restaurante" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'unreachable'}>
        <Stack.Screen name="sin-conexion" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'restoring' || status === 'resolving'}>
        <Stack.Screen name="conectando" />
      </Stack.Protected>
    </Stack>
  );
}
