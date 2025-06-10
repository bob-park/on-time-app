import { useContext, useEffect, useState } from 'react';

import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { exchangeCodeAsync, fetchUserInfoAsync, makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { MaterialIcons } from '@expo/vector-icons';

import SplashLottie from '@/assets/lotties/splash-lottie.json';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import delay from '@/utils/delay';

import cx from 'classnames';
import LottieView from 'lottie-react-native';

const KEY_ACCESS_TOKEN = 'accessToken';
const KEY_REFRESH_TOKEN = 'refreshToken';
const KEY_EXPIRED_AT = 'expiredAt';

WebBrowser.maybeCompleteAuthSession();

const clientId = process.env.EXPO_PUBLIC_AUTHORIZATION_CLIENT_ID || '';
const clientSecret = process.env.EXPO_PUBLIC_AUTHORIZATION_CLIENT_SECRET || '';

const discovery = {
  authorizationEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/oauth2/authorize`,
  tokenEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/oauth2/token`,
  revocationEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/oauth2/revoke`,
};

const redirectUri = makeRedirectUri({
  scheme: 'ontime',
  native: 'ontime://callback',
});

export default function LoginPage() {
  // context
  const { onLoggedIn } = useContext(AuthContext);

  // state
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // hooks
  const router = useRouter();
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      clientSecret,
      scopes: ['openid', 'profile'],
      redirectUri,
      responseType: 'code',
    },
    discovery,
  );

  // useEffect
  useEffect(() => {
    if (response?.type === 'success') {
      setIsLoggingIn(true);

      const { code } = response.params;

      exchangeCodeAsync(
        { clientId, clientSecret, redirectUri, code, extraParams: { code_verifier: request?.codeVerifier || '' } },
        discovery,
      )
        .then((data) => {
          Promise.all([
            SecureStore.setItemAsync(KEY_ACCESS_TOKEN, data.accessToken),
            SecureStore.setItemAsync(KEY_REFRESH_TOKEN, data.refreshToken || ''),
            SecureStore.setItemAsync(KEY_EXPIRED_AT, (data.expiresIn || 0) + data.issuedAt + ''),
          ]);

          fetchUserInfoAsync(
            {
              accessToken: data.accessToken,
            },
            {
              userInfoEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/userinfo`,
            },
          )
            .then((data) => {
              if (!data) {
                throw new Error('null');
              }

              return data.profile as User;
            })
            .then((user) => onLoggedIn(user));
        })
        .then(async () => {
          await delay(1_000);

          setIsLoggingIn(true);

          router.replace('/(tabs)/(home)');
        })
        .catch((err) => console.error(err));
    }
  }, [response]);

  return (
    <View className="flex size-full flex-col items-center justify-center gap-10 p-10">
      <View className="flex flex-col items-center justify-center">
        <LottieView style={{ width: 150, height: 150 }} source={SplashLottie} autoPlay loop />

        <View className="">
          <Text className="text-4xl font-bold text-blue-500">On Time</Text>
        </View>
      </View>
      <View className="w-[80%]">
        <TouchableOpacity
          className={cx('flex flex-row items-center justify-center gap-2 rounded-2xl p-4', {
            'bg-black': !isLoggingIn,
            'bg-gray-500': isLoggingIn,
          })}
          disabled={isLoggingIn}
          onPress={() => {
            promptAsync();
          }}
        >
          {isLoggingIn ? (
            <ActivityIndicator size="large" color="#d1d5db" />
          ) : (
            <MaterialIcons name="login" size={24} color="white" />
          )}
          <Text className="text-xl font-semibold text-white">{isLoggingIn ? '로그인 중' : '로그인'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
