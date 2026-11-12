/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs';

import type { ConfigContext, ExpoConfig } from 'expo/config';
import { withAppDelegate, withEntitlementsPlist, withInfoPlist, type ConfigPlugin } from 'expo/config-plugins';

// Native configuration of the app (Continuous Native Generation): `npx expo prebuild` / `npx expo run:android`
// create android/ and ios/ from this file. Never edit them by hand; change this file and rebuild.
// Colors are the manual's brand values (section 2.1): petrol #103B46, petrol night #0B2D36, cream #FAF7F1.

// Android Google Maps key (Reparto 2.5 and 7): read here from .env when building, never written in the repo and
// never EXPO_PUBLIC_* (so it is not in the JavaScript bundle). Without it the build has no map and the app
// shows only the list (`extra.mapsEnabled`), because the Maps SDK crashes without a key.
const googleMapsAndroidApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim() || undefined;

// Push notifications (Sprint 4) on Android come through Firebase Cloud Messaging, which needs the google-services.json
// of the Firebase project in the build. It is not in the repo (ask Sebastián; it goes at the root): without it the app
// builds the same, only without remote push (the local reminder still works).
const googleServicesFile = existsSync('./google-services.json') ? './google-services.json' : undefined;

// iOS (Sprint 4). Google Maps for iOS has its own key (GOOGLE_MAPS_IOS_API_KEY, same rules as the Android one).
const googleMapsIosApiKey = process.env.GOOGLE_MAPS_IOS_API_KEY?.trim() || undefined;

// Google Sign-In on iOS needs the iOS OAuth client of the Firebase project and its reversed id as URL scheme. Both
// come from GoogleService-Info.plist (Firebase console → iOS app), which is not in the repo either: without it, iOS
// builds the same and «Continuar con Google» says it is not available (email sign-in works).
function readIosGoogleClient(): { clientId: string; urlScheme: string } | undefined {
  if (!existsSync('./GoogleService-Info.plist')) return undefined;
  const plist = readFileSync('./GoogleService-Info.plist', 'utf8');
  const value = (key: string) => plist.match(new RegExp(`<key>${key}</key>\\s*<string>([^<]+)</string>`))?.[1];
  const clientId = value('CLIENT_ID');
  const urlScheme = value('REVERSED_CLIENT_ID');
  return clientId && urlScheme ? { clientId, urlScheme } : undefined;
}
const iosGoogleClient = readIosGoogleClient();

// Remote push on iOS needs the `aps-environment` entitlement, which only the paid Apple Developer Program can sign: a
// free Apple ID (Personal Team) rejects the build. expo-notifications adds it, so it is removed unless
// IOS_PUSH_ENABLED=true. iOS keeps the local «vence pronto» reminder, which needs no entitlement.
const withoutRemotePushOnIos: ConfigPlugin = (config) =>
  withEntitlementsPlist(config, (mod) => {
    if (process.env.IOS_PUSH_ENABLED !== 'true') delete mod.modResults['aps-environment'];
    return mod;
  });

// iOS 27 stops any app that does not adopt the scene life cycle (UIScene) at launch. Expo SDK 57 ships the scene
// delegate for it (`ExpoAppSceneDelegate`), but its prebuild template still starts React Native from the app
// delegate. This declares the scene in Info.plist and lets the scene create the window: the AppDelegate only builds
// the React Native factory and hands it over (`ExpoReactNativeFactoryProvider`). Remove when the template does it.
const IOS_WINDOW_START = /#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\([\s\S]*?\)\s*#endif/;

const withIosSceneLifecycle: ConfigPlugin = (config) => {
  config = withInfoPlist(config, (mod) => {
    mod.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          { UISceneConfigurationName: 'Default Configuration', UISceneDelegateClassName: 'EXExpoAppSceneDelegate' },
        ],
      },
    };
    return mod;
  });
  return withAppDelegate(config, (mod) => {
    let source = mod.modResults.contents;
    if (source.includes('ExpoReactNativeFactoryProvider')) return mod;
    if (!IOS_WINDOW_START.test(source)) {
      throw new Error('withIosSceneLifecycle: the AppDelegate template changed; review app.config.ts.');
    }
    source = source
      .replace('class AppDelegate: ExpoAppDelegate {', 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {')
      .replace(IOS_WINDOW_START, '// The window and React Native start in ExpoAppSceneDelegate (UIScene life cycle, iOS 27).');
    mod.modResults.contents = source;
    return mod;
  });
};

const baseConfig = ({ config }: ConfigContext): ExpoConfig => ({
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
    googleServicesFile,
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
    ['react-native-maps', { androidGoogleMapsApiKey: googleMapsAndroidApiKey, iosGoogleMapsApiKey: googleMapsIosApiKey }],
    [
      // Notifications (Sprint 4): white symbol on the status bar, tinted with the brand orange in the shade.
      'expo-notifications',
      { icon: './assets/images/notification-icon.png', color: '#F46935' },
    ],
    // Google Sign-In: on Android the native module needs no config (autolinking; the OAuth client is matched by
    // package + SHA-1). On iOS its plugin adds the URL scheme the Google sign-in sheet returns to. Only with the plist.
    ...(iosGoogleClient
      ? [['@react-native-google-signin/google-signin', { iosUrlScheme: iosGoogleClient.urlScheme }] as [string, object]]
      : []),
  ],
  extra: {
    ...config.extra,
    mapsEnabled: googleMapsAndroidApiKey !== undefined,
    mapsEnabledIos: googleMapsIosApiKey !== undefined,
    // The iOS OAuth client id is public (it is in the app either way), like EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.
    googleIosClientId: iosGoogleClient?.clientId ?? null,
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});

// The two iOS plugins of this file go on top of the config (the `plugins` list only takes package names).
export default (context: ConfigContext): ExpoConfig => withIosSceneLifecycle(withoutRemotePushOnIos(baseConfig(context)));
