import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { Button, Text } from '@/components/ui';
import { useAuth } from '@/features/session/SessionProvider';

/** Sergio builds this screen (data of GET /me, theme, "Cerrar sesión" with confirmation, app version). */
export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  return (
    <ScreenPlaceholder title="Perfil" description="Tus datos, el tema de la app y cerrar sesión." owner="Sergio">
      {profile ? (
        <Text variant="sec" tone="secondary">
          {profile.displayName ?? profile.email.split('@')[0]} · {profile.email}
        </Text>
      ) : null}
      <Button variant="outline" label="Cerrar sesión" onPress={signOut} />
    </ScreenPlaceholder>
  );
}
