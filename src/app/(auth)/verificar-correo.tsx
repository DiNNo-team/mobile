import { useState } from 'react';
import { View } from 'react-native';

import { Alert, Button, Text, useToast } from '@/components/ui';
import { resendVerificationEmail } from '@/features/session/account-actions';
import { getFirebaseActionErrorMessage } from '@/features/session/auth-errors';
import { AuthScreen } from '@/features/session/components/AuthScreen';
import { useAuth } from '@/features/session/SessionProvider';

type Busy = 'checking' | 'sending' | 'leaving' | null;

/** Email not verified yet. Once verified, the session continues the flow and opens the diner's area. */
export default function VerifyEmailScreen() {
  const { user, reloadEmailVerification, signOut } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState<Busy>(null);
  const [notVerifiedYet, setNotVerifiedYet] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (kind: Exclude<Busy, null>, action: () => Promise<void>) => {
    setBusy(kind);
    setActionError(null);
    setNotVerifiedYet(false);
    await action();
    setBusy(null);
  };

  const checkVerification = () =>
    run('checking', async () => {
      try {
        if (!(await reloadEmailVerification())) setNotVerifiedYet(true);
      } catch (error) {
        setActionError(getFirebaseActionErrorMessage(error, 'No pudimos comprobar tu correo. Intenta de nuevo.'));
      }
    });

  const resend = () =>
    run('sending', async () => {
      const result = await resendVerificationEmail();
      if (result.ok) {
        showToast({
          type: 'success',
          message: 'Correo de verificación enviado. Revisa tu bandeja de entrada y la carpeta de spam.',
        });
      } else {
        setActionError(result.message);
      }
    });

  const leave = () =>
    run('leaving', async () => {
      try {
        await signOut();
      } catch {
        setActionError('No pudimos cerrar sesión. Intenta de nuevo.');
      }
    });

  return (
    <AuthScreen>
      <View className="gap-2">
        <Text variant="h1" accessibilityRole="header">
          Revisa tu correo
        </Text>
        <Text variant="body" tone="secondary">
          {user?.email
            ? `Te enviamos un enlace a ${user.email} para verificar tu cuenta.`
            : 'Te enviamos un enlace para verificar tu cuenta.'}{' '}
          Ábrelo, vuelve aquí y toca «Ya lo verifiqué». Si no lo ves, revisa la carpeta de spam.
        </Text>
      </View>

      {notVerifiedYet ? (
        <Alert type="warning" message="Todavía no vemos tu correo verificado. Abre el enlace del correo e intenta de nuevo." />
      ) : null}
      {actionError ? <Alert type="error" message={actionError} /> : null}

      <View className="gap-3">
        <Button
          label="Ya lo verifiqué"
          loading={busy === 'checking'}
          loadingLabel="Comprobando…"
          disabled={busy !== null}
          fullWidth
          onPress={checkVerification}
        />
        <Button
          variant="secondary"
          label="Reenviar correo"
          loading={busy === 'sending'}
          loadingLabel="Enviando correo…"
          disabled={busy !== null}
          fullWidth
          onPress={resend}
        />
        <Button
          variant="ghost"
          label="Cerrar sesión"
          loading={busy === 'leaving'}
          loadingLabel="Cerrando sesión…"
          disabled={busy !== null}
          fullWidth
          onPress={leave}
        />
      </View>
    </AuthScreen>
  );
}
