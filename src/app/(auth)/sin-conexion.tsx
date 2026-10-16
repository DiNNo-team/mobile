import { useState } from 'react';

import { Button, ErrorState } from '@/components/ui';
import { AuthScreen } from '@/features/session/components/AuthScreen';
import { useAuth } from '@/features/session/SessionProvider';
import { getErrorMessage } from '@/lib/api/errors';

/** A saved session could not reach the backend: retry the single flow, or sign out. */
export default function UnreachableScreen() {
  const { lastError, refreshProfile, signOut } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const retry = async () => {
    setRetrying(true);
    await refreshProfile();
    setRetrying(false);
  };

  return (
    <AuthScreen align="center" showLogo={false}>
      <ErrorState
        title="No pudimos conectarnos con DiNNo"
        description={getErrorMessage(lastError)}
        onRetry={retry}
        retrying={retrying}
      />
      <Button variant="ghost" label="Cerrar sesión" onPress={signOut} disabled={retrying} className="self-center" />
    </AuthScreen>
  );
}
