import { Image } from 'react-native';

/** Official Google "G" (Google Sign-In branding guidelines, signin-assets.zip), 1x/2x/3x with transparent background. */
const GOOGLE_G = require('../../../assets/images/google-g.png');
const SIZE = 20;

/**
 * Logo for "Continuar con Google" (`<Button leading={<GoogleLogo />} />`). It is another company's brand: it keeps
 * Google's own colors and shape (never DiNNo tokens), at 20 like the kit icons, in light and dark mode.
 */
export function GoogleLogo() {
  return <Image source={GOOGLE_G} style={{ width: SIZE, height: SIZE }} accessibilityIgnoresInvertColors accessible={false} />;
}
