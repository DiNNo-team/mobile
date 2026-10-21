import type { ConfigContext, ExpoConfig } from 'expo/config';

// Native configuration of the app (Continuous Native Generation): `npx expo prebuild` / `npx expo run:android`
// create android/ from this file. Never edit android/ by hand; change this file and rebuild.
// Colors are the manual's brand values (section 2.1): petrol #103B46, petrol night #0B2D36, cream #FAF7F1.

// Android Google Maps key (Reparto 2.5 and 7): read here from .env when building, never written in the repo and
// never EXPO_PUBLIC_* (so it is not in the JavaScript bundle). Without it the build has no map and the app
// shows only the list (`extra.mapsEnabled`), because the Maps SDK crashes without a key.
const googleMapsAndroidApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim() || undefined;

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
    [
      // Foreground location only (ACCESS_COARSE/FINE_LOCATION). No background location, no motion data.
      'expo-location',
      {
        locationWhenInUsePermission: 'DiNNo usa tu ubicación para mostrarte restaurantes con mesa cerca de ti.',
        locationAlwaysAndWhenInUsePermission: false,
        locationAlwaysPermission: false,
        motionUsagePermission: false,
      },
    ],
    ['react-native-maps', { androidGoogleMapsApiKey: googleMapsAndroidApiKey }],
    // @react-native-google-signin/google-signin is not listed on purpose: its plugin only sets up Firebase native
    // files (google-services.json, which we do not use: Firebase is the JS SDK) or, with options, the iOS URL
    // scheme (`iosUrlScheme`, required by the plugin). On Android the native module needs no config: autolinking
    // adds it and the OAuth client is matched by package + SHA-1. Add it with `iosUrlScheme` when iOS is built.
  ],
  extra: {
    ...config.extra,
    mapsEnabled: googleMapsAndroidApiKey !== undefined,
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
