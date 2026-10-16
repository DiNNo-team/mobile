import { Stack } from 'expo-router';

/** Screens without a session: login, sign-up, email verification and the wrong-account message. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
