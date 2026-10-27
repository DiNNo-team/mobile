import { router } from 'expo-router';
import { Lock, Mail, User } from 'lucide-react-native';
import { useRef, useState, type RefObject } from 'react';
import { View, type TextInput } from 'react-native';

import { Alert, Button, Text, TextField } from '@/components/ui';
import { env } from '@/config/env';
import { createAccountWithVerification } from '@/features/session/account-actions';
import { getFirebaseSignUpErrorMessage } from '@/features/session/auth-errors';
import { AuthScreen } from '@/features/session/components/AuthScreen';
import { DISPLAY_NAME_MAX_LENGTH } from '@/features/session/profile-flow';
import { useAuth } from '@/features/session/SessionProvider';
import { MOCK_ACCOUNTS } from '@/features/session/session.mock';
import { validateDisplayName, validateEmail, validateNewPassword } from '@/features/session/validation';

type Field = 'name' | 'email' | 'password';
type FieldErrors = Partial<Record<Field, string>>;

const FIELDS: Field[] = ['name', 'email', 'password'];

/** Diner sign-up: once the account exists its email is unverified, so the session opens /verificar-correo. */
export default function SignUpScreen() {
  const { signInWithFirebase, signInWithEmail } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const refs: Record<Field, RefObject<TextInput | null>> = { name: nameRef, email: emailRef, password: passwordRef };

  const invalidFields = FIELDS.filter((field) => errors[field]);

  const submit = async () => {
    const nextErrors: FieldErrors = {
      name: validateDisplayName(name),
      email: validateEmail(email),
      password: validateNewPassword(password),
    };
    setErrors(nextErrors);
    const firstInvalid = FIELDS.find((field) => nextErrors[field]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }
    setFormError(null);
    setSubmitting(true);
    // Example data has no Firebase: the example unverified account shows the verification screen.
    const result = env.useMocks
      ? await signInWithEmail(MOCK_ACCOUNTS.unverified, password)
      : await signInWithFirebase(() => createAccountWithVerification(email, password), {
          errorMessage: getFirebaseSignUpErrorMessage,
          displayName: name.trim(),
        });
    setSubmitting(false);
    if (!result.ok) setFormError(result.message);
  };

  return (
    <AuthScreen tabs={{ active: 'signup', onSelect: () => router.back() }}>
      <View className="gap-2">
        <Text variant="h1" accessibilityRole="header">
          Crea tu cuenta
        </Text>
        <Text variant="body">
          Encuentra una mesa disponible ahora y asegúrala mientras llegas.
        </Text>
      </View>

      {invalidFields.length > 2 ? (
        <Alert type="error" message={`Revisa los ${invalidFields.length} campos marcados.`} />
      ) : null}
      {formError ? <Alert type="error" message={formError} /> : null}
      {env.useMocks && __DEV__ ? (
        <Alert
          type="info"
          title="Datos de ejemplo"
          message={`No se crea una cuenta real: pasas a la verificación con ${MOCK_ACCOUNTS.unverified}.`}
        />
      ) : null}

      <View className="gap-4">
        <TextField
          ref={nameRef}
          label="Nombre"
          icon={User}
          placeholder="Ej.: Ana María"
          value={name}
          onChangeText={setName}
          onBlur={() => name && setErrors((current) => ({ ...current, name: validateDisplayName(name) }))}
          errorText={errors.name}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
          disabled={submitting}
        />
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
        <TextField
          ref={passwordRef}
          label="Contraseña"
          icon={Lock}
          password
          helperText="Mínimo 8 caracteres."
          value={password}
          onChangeText={setPassword}
          onBlur={() => password && setErrors((current) => ({ ...current, password: validateNewPassword(password) }))}
          errorText={errors.password}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
          disabled={submitting}
        />
      </View>

      <Button label="Crear cuenta" loading={submitting} loadingLabel="Creando cuenta…" fullWidth onPress={submit} />

      <View className="flex-row flex-wrap items-center justify-center">
        <Text variant="sec">
          ¿Ya tienes cuenta?
        </Text>
        <Button variant="ghost" size="sm" label="Inicia sesión" onPress={() => router.back()} disabled={submitting} />
      </View>
    </AuthScreen>
  );
}
