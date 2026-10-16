import { PlaceholderLink, ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { Button, SegmentedControl, Text } from '@/components/ui';
import { useAuth } from '@/features/session/SessionProvider';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
] as const satisfies readonly { value: ThemePreference; label: string }[];

/** Sergio builds this screen (data of GET /me, theme, "Cerrar sesión" with confirmation, app version). */
export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { preference, setPreference } = useTheme();
  return (
    <ScreenPlaceholder title="Perfil" description="Tus datos, el tema de la app y cerrar sesión." owner="Sergio">
      {profile ? (
        <Text variant="sec" tone="secondary">
          {profile.displayName ?? profile.email.split('@')[0]} · {profile.email}
        </Text>
      ) : null}
      <Text variant="label" tone="secondary" className="mt-4">
        Tema
      </Text>
      <SegmentedControl options={THEME_OPTIONS} value={preference} onChange={setPreference} accessibilityLabel="Tema" />
      {__DEV__ ? <PlaceholderLink href="/kit" label="Ver el kit móvil" /> : null}
      <Button variant="outline" label="Cerrar sesión" onPress={signOut} className="mt-4" />
    </ScreenPlaceholder>
  );
}
