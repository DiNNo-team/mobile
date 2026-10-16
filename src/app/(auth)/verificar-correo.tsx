import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { Button, Text } from '@/components/ui';
import { useAuth } from '@/features/session/SessionProvider';

/** Jacobo builds this screen ("Reenviar", "Ya lo verifiqué" with useAuth().reloadEmailVerification). */
export default function VerifyEmailScreen() {
  const { user, signOut } = useAuth();
  return (
    <ScreenPlaceholder title="Revisa tu correo" description="Verifica tu correo para continuar." owner="Jacobo">
      {user?.email ? (
        <Text variant="sec" tone="secondary">
          Cuenta: {user.email}
        </Text>
      ) : null}
      <Button variant="outline" label="Cerrar sesión" onPress={signOut} />
    </ScreenPlaceholder>
  );
}
