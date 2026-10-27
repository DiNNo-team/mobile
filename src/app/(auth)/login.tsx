import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useRef, useState } from 'react';
import { View, type TextInput } from 'react-native';

import { Alert, Button, GoogleLogo, Text, TextField } from '@/components/ui';
import { env } from '@/config/env';
import { getFirebaseGoogleSignInErrorMessage } from '@/features/session/auth-errors';
import { AuthScreen } from '@/features/session/components/AuthScreen';
import { getFirebaseAuth } from '@/features/session/firebase';
import { MOCK_GOOGLE_EMAIL, requestGoogleIdToken } from '@/features/session/google';
import { useAuth } from '@/features/session/SessionProvider';
import { MOCK_ACCOUNTS } from '@/features/session/session.mock';
import { validateEmail, validateSignInPassword } from '@/features/session/validation';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const { signInWithEmail, signInWithFirebase, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const busy = submitting || googleSigningIn;
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const submit = async () => {
    const nextErrors: FieldErrors = { email: validateEmail(email), password: validateSignInPassword(password) };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) {
      (nextErrors.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    setFormError(null);
    clearNotice();
    setSubmitting(true);
    const result = await signInWithEmail(email, password);
    setSubmitting(false);
    // On success the session guards open Explorar (or the screen of the account), nothing to do here.
    if (!result.ok) setFormError(result.message);
  };

  const continueWithGoogle = async () => {
    setFormError(null);
    clearNotice();
    setGoogleSigningIn(true);
    const result = await signInWithGoogle();
    setGoogleSigningIn(false);
    if (result) setFormError(result);
  };

  /** Returns the message to show, or null when it worked or the person closed the Google window. */
  const signInWithGoogle = async (): Promise<string | null> => {
    // Example data never calls Google: it signs in as an example diner.
    if (env.useMocks) {
      const result = await signInWithEmail(MOCK_GOOGLE_EMAIL, 'google');
      return result.ok ? null : result.message;
    }
    const token = await requestGoogleIdToken();
    if (token.kind === 'cancelled') return null;
    if (token.kind === 'error') return token.message;
    const result = await signInWithFirebase(
      () => signInWithCredential(getFirebaseAuth(), GoogleAuthProvider.credential(token.idToken)),
      { errorMessage: getFirebaseGoogleSignInErrorMessage },
    );
    return result.ok ? null : result.message;
  };

  return (
    <AuthScreen tabs={{ active: 'signin', onSelect: () => router.push('/crear-cuenta') }}>
      <View className="gap-2">
        <Text variant="h1" accessibilityRole="header">
          Inicia sesión
        </Text>
        <Text variant="body">
          Encuentra una mesa disponible ahora y asegúrala mientras llegas.
        </Text>
      </View>

      {notice ? <Alert type="info" message={notice} /> : null}
      {formError ? <Alert type="error" message={formError} /> : null}
      {env.useMocks && __DEV__ ? (
        <Alert
          type="info"
          title="Datos de ejemplo"
          message={`Cualquier correo entra como comensal. Prueba también ${MOCK_ACCOUNTS.restaurant}, ${MOCK_ACCOUNTS.unverified} o ${MOCK_ACCOUNTS.unreachable}, y la contraseña «${MOCK_ACCOUNTS.wrongPassword}».`}
        />
      ) : null}

      <View className="gap-4">
        <TextField
          ref={emailRef}
          label="Correo"
          icon={Mail}
          placeholder="Ej.: ana@correo.com"
          value={email}
          onChangeText={setEmail}
          onBlur={() => email && setErrors((current) => ({ ...current, email: validateEmail(email) }))}
          errorText={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          disabled={busy}
        />
        <View className="gap-1">
          <TextField
            ref={passwordRef}
            label="Contraseña"
            icon={Lock}
            password
            value={password}
            onChangeText={setPassword}
            errorText={errors.password}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={submit}
            disabled={busy}
          />
          <Button
            variant="ghost"
            size="sm"
            label="¿Olvidaste tu contraseña?"
            onPress={() => router.push('/recuperar-contrasena')}
            disabled={busy}
            className="-ml-4"
          />
        </View>
      </View>

      <View className="gap-3">
        <Button
          label="Iniciar sesión"
          loading={submitting}
          loadingLabel="Iniciando sesión…"
          disabled={googleSigningIn}
          fullWidth
          onPress={submit}
        />
        <Button
          variant="outline"
          leading={<GoogleLogo />}
          label="Continuar con Google"
          loading={googleSigningIn}
          loadingLabel="Conectando con Google…"
          disabled={submitting}
          fullWidth
          onPress={continueWithGoogle}
        />
      </View>

      <View className="flex-row flex-wrap items-center justify-center">
        <Text variant="sec">
          ¿No tienes cuenta?
        </Text>
        <Button variant="ghost" size="sm" label="Crea tu cuenta" onPress={() => router.push('/crear-cuenta')} disabled={busy} />
      </View>
    </AuthScreen>
  );
}
