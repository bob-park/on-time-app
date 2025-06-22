import { useContext, useEffect, useState } from 'react';

import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { exchangeCodeAsync, fetchUserInfoAsync, useAuthRequest } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { MaterialIcons } from '@expo/vector-icons';

import SplashLottie from '@/assets/lotties/splash-lottie.json';
import dayjs from '@/shared/dayjs';
import { AuthContext, clientId, clientSecret, discovery, redirectUri } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import delay from '@/utils/delay';

import cx from 'classnames';
import LottieView from 'lottie-react-native';

const KEY_ACCESS_TOKEN = 'accessToken';
const KEY_REFRESH_TOKEN = 'refreshToken';
const KEY_EXPIRED_AT = 'expiredAt';

WebBrowser.maybeCompleteAuthSession();

export default function LoginPage() {
  // context
  const { onLoggedIn } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

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
        {
          clientId,
          clientSecret,
          redirectUri,
          code,
          extraParams: { code_verifier: request?.codeVerifier || '', grant_type: 'authorization_code' },
        },
        discovery,
      )
        .then((data) => {
          const unixtimestamp = (data.expiresIn || 0) + data.issuedAt;

          Promise.all([
            SecureStore.setItemAsync(KEY_ACCESS_TOKEN, data.accessToken),
            SecureStore.setItemAsync(KEY_REFRESH_TOKEN, data.refreshToken || ''),
            SecureStore.setItemAsync(KEY_EXPIRED_AT, dayjs.unix(unixtimestamp).toISOString()),
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
            .then((user) => onLoggedIn(user))
            .catch((err) => console.error(err));
        })
        .then(async () => {
          await delay(1_000);

          setIsLoggingIn(true);

          router.replace('/(tabs)/(home)');
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [response]);

  return (
    <View className="flex size-full flex-col items-center justify-center gap-10 bg-white p-10 dark:bg-black">
      <View className="flex flex-col items-center justify-center">
        <LottieView style={{ width: 150, height: 150 }} source={SplashLottie} autoPlay loop />

        <View className="">
          <Text className="text-4xl font-bold text-blue-500 dark:text-blue-300">On Time</Text>
        </View>
      </View>
      <View className="w-[80%]">
        <TouchableOpacity
          className={cx('flex flex-row items-center justify-center gap-2 rounded-2xl p-4', {
            'bg-black dark:bg-white': !isLoggingIn,
            'bg-gray-500 dark:bg-gray-400': isLoggingIn,
          })}
          disabled={isLoggingIn}
          onPress={() => {
            promptAsync();
          }}
        >
          {isLoggingIn ? (
            <ActivityIndicator size="small" color={theme === 'light' ? '#d1d5db' : '#4b5563'} />
          ) : (
            <MaterialIcons name="login" size={24} color={theme === 'light' ? 'white' : 'black'} />
          )}
          <Text className="text-xl font-bold text-white dark:text-black">{isLoggingIn ? '로그인 중' : '로그인'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
