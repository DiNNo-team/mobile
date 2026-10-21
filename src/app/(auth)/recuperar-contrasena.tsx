import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { View, type TextInput } from 'react-native';

import { Alert, Button, Text, TextField } from '@/components/ui';
import { PASSWORD_RESET_SENT_MESSAGE, requestPasswordReset } from '@/features/session/account-actions';
import { AuthScreen } from '@/features/session/components/AuthScreen';
import { validateEmail } from '@/features/session/validation';

/** Sends the Firebase password reset link. The confirmation never says whether the account exists (like the web). */
export default function RecoverPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const emailRef = useRef<TextInput>(null);

  const submit = async () => {
    const nextError = validateEmail(email);
    setEmailError(nextError);
    if (nextError) {
      emailRef.current?.focus();
      return;
    }
    setFormError(null);
    setSent(false);
    setSending(true);
    const result = await requestPasswordReset(email);
    setSending(false);
    if (result.ok) setSent(true);
    else setFormError(result.message);
  };

  return (
    <AuthScreen>
      <View className="gap-2">
        <Text variant="h1" accessibilityRole="header">
          Recupera tu contraseña
        </Text>
        <Text variant="body" tone="secondary">
          Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.
        </Text>
      </View>

      {sent ? <Alert type="success" message={PASSWORD_RESET_SENT_MESSAGE} /> : null}
      {formError ? <Alert type="error" message={formError} /> : null}

      <TextField
        ref={emailRef}
        label="Correo"
        icon={Mail}
        placeholder="Ej.: ana@correo.com"
        value={email}
        onChangeText={setEmail}
        onBlur={() => email && setEmailError(validateEmail(email))}
        errorText={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={submit}
        disabled={sending}
      />

      <View className="gap-3">
        <Button label="Enviar enlace" loading={sending} loadingLabel="Enviando correo…" fullWidth onPress={submit} />
        <Button variant="ghost" label="Volver a iniciar sesión" fullWidth onPress={() => router.back()} disabled={sending} />
      </View>
    </AuthScreen>
  );
}
