import { PlaceholderLink, ScreenPlaceholder } from '@/components/ScreenPlaceholder';

/** Jacobo builds this screen (name, email and password; useAuth().signInWithFirebase with the sign-up). */
export default function SignUpScreen() {
  return (
    <ScreenPlaceholder title="Crea tu cuenta" description="Nombre, correo y contraseña para empezar a encontrar mesa." owner="Jacobo">
      <PlaceholderLink href="/login" label="Volver a iniciar sesión" />
    </ScreenPlaceholder>
  );
}
