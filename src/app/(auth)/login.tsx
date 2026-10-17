import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { View, type TextInput } from 'react-native';

import { Alert, Button, Text, TextField } from '@/components/ui';
import { env } from '@/config/env';
import { AuthScreen } from '@/features/session/components/AuthScreen';
import { useAuth } from '@/features/session/SessionProvider';
import { MOCK_ACCOUNTS } from '@/features/session/session.mock';
import { validateEmail, validateSignInPassword } from '@/features/session/validation';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const { signInWithEmail, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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

  return (
    <AuthScreen>
      <View className="gap-2">
        <Text variant="h1" accessibilityRole="header">
          Inicia sesión
        </Text>
        <Text variant="body" tone="secondary">
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
          disabled={submitting}
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
            disabled={submitting}
          />
          <Button
            variant="ghost"
            size="sm"
            label="¿Olvidaste tu contraseña?"
            onPress={() => router.push('/recuperar-contrasena')}
            disabled={submitting}
            className="-ml-4"
          />
        </View>
      </View>

      <View className="gap-3">
        <Button label="Iniciar sesión" loading={submitting} loadingLabel="Iniciando sesión…" fullWidth onPress={submit} />
        {/* Jacobo: the "Continuar con Google" button (variant outline) goes right here, with useAuth().signInWithFirebase. */}
      </View>

      <View className="flex-row flex-wrap items-center justify-center">
        <Text variant="sec" tone="secondary">
          ¿No tienes cuenta?
        </Text>
        <Button variant="ghost" size="sm" label="Crea tu cuenta" onPress={() => router.push('/crear-cuenta')} disabled={submitting} />
      </View>
    </AuthScreen>
  );
}
