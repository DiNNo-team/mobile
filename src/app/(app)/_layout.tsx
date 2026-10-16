import { Stack } from 'expo-router';

/** Screens of a diner with a session: the tabs and the restaurant detail on top of them. */
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
