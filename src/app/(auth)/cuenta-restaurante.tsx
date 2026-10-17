import { useState } from 'react';

import { Button, EmptyState } from '@/components/ui';
import { AuthScreen } from '@/features/session/components/AuthScreen';
import { useAuth } from '@/features/session/SessionProvider';

/** Restaurant account signed in to the app (Reparto 2.1): friendly message + "Cerrar sesión". */
export default function RestaurantAccountScreen() {
  const { signOut } = useAuth();
  const [leaving, setLeaving] = useState(false);

  const leave = async () => {
    setLeaving(true);
    await signOut();
  };

  return (
    <AuthScreen align="center" showLogo={false}>
      <EmptyState
        title="Esta es una cuenta de restaurante"
        description="Administra tu restaurante desde la web."
        action={<Button label="Cerrar sesión" loading={leaving} loadingLabel="Cerrando sesión…" onPress={leave} />}
      />
    </AuthScreen>
  );
}
