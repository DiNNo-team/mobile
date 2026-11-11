import { Stack } from 'expo-router';

/**
 * Explorar and Perfil. Mobile v3 (diseño definitivo) has no bottom bar: Explorar is the home and Perfil opens from the
 * avatar inside its search field, with a back button. The group keeps its name so the routes (`/`, `/perfil`) do not
 * change.
 */
export default function ExploreLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
