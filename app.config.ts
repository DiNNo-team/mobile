import type { ConfigContext, ExpoConfig } from 'expo/config';

// Native configuration of the app (Continuous Native Generation): `npx expo prebuild` / `npx expo run:android`
// create android/ from this file. Never edit android/ by hand; change this file and rebuild.
// Colors are the manual's brand values (section 2.1): petrol #103B46, petrol night #0B2D36, cream #FAF7F1.

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'DiNNo',
  slug: 'dinno-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'dinno',
  userInterfaceStyle: 'automatic',
  backgroundColor: '#FAF7F1',
  android: {
    package: 'com.dinno.app',
    adaptiveIcon: {
      backgroundColor: '#103B46',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  ios: {
    bundleIdentifier: 'com.dinno.app',
    supportsTablet: false,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      // Plus Jakarta Sans embedded in the build: available from the first frame, with the family names of
      // the manual's tokens (PlusJakartaSans_500Medium…), which on Android are the file names.
      'expo-font',
      {
        fonts: [
          'node_modules/@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf',
          'node_modules/@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf',
          'node_modules/@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf',
        ],
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 88,
        backgroundColor: '#FAF7F1',
        dark: {
          image: './assets/images/splash-icon-dark.png',
          backgroundColor: '#0B2D36',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
