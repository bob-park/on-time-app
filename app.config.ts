import { ConfigContext, ExpoConfig } from 'expo/config';

import { version } from './package.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'On Time',
  slug: 'on-time-app',
  version,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'ontime',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bobpark.ontimeapp',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ['remote-notification'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/icon.png',
      backgroundColor: '#ffffff',
    },
    permissions: ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION'],
    package: 'com.bobpark.ontimeapp',
    googleServicesFile: './google-services.json',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow ${PRODUCT_NAME} to use your location.',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './assets/images/icon.png',
        imageWidth: 200,
      },
    ],
    'expo-web-browser',
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: true,
        },
        ios: {
          infoPlist: {
            NSAppTransportSecurity: {
              NSAllowsArbitraryLoads: true,
            },
          },
        },
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        enableBackgroundRemoteNotifications: true,
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone.',
      },
    ],
    'expo-font',
    'expo-secure-store',
    'expo-navigation-bar',
    'expo-status-bar',
    'expo-asset',
    'expo-localization',
    'expo-image',
    [
      // Live Activity 는 런타임에서 createLiveActivity('WorkLiveActivity', ...) 로 등록한다.
      // widgets[] 배열은 홈/잠금화면 위젯 전용이며, supportedFamilies 없는 항목은
      // invalid target 을 생성해 빌드가 깨지므로 Live Activity 는 여기에 추가하지 않는다.
      'expo-widgets',
      {
        groupIdentifier: 'group.com.bobpark.ontimeapp',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: 'a2bd6ae3-c957-432e-b06e-0cead12809d3',
    },
  },
});
