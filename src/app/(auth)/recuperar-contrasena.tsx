import { PlaceholderLink, ScreenPlaceholder } from '@/components/ScreenPlaceholder';

/** Jacobo builds this screen (Firebase sendPasswordResetEmail, same behavior as the web). */
export default function RecoverPasswordScreen() {
  return (
    <ScreenPlaceholder
      title="Recupera tu contraseña"
      description="Te enviaremos un correo para crear una contraseña nueva."
      owner="Jacobo"
    >
      <PlaceholderLink href="/login" label="Volver a iniciar sesión" />
    </ScreenPlaceholder>
  );
}
