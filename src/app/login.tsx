import { useContext, useEffect, useState } from 'react';

import { ActivityIndicator, Text, View } from 'react-native';

import { exchangeCodeAsync, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { MaterialIcons } from '@expo/vector-icons';

import SplashLottie from '@/assets/lotties/splash-lottie.json';
import { Button } from '@/shared/components/ui';
import { AuthContext, clientId, clientSecret, discovery, redirectUri } from '@/shared/providers/auth/AuthProvider';
import delay from '@/utils/delay';

import LottieView from 'lottie-react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginPage() {
  // context
  const { onLoggedIn } = useContext(AuthContext);

  // state
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // hooks
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      clientSecret,
      scopes: ['openid', 'profile', 'users:read:summary'],
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
          onLoggedIn(data);
        })
        .then(async () => {
          await delay(1_000);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [response]);

  return (
    <View className="flex size-full flex-col items-center justify-center gap-12 bg-base p-10 dark:bg-base-dark">
      <View className="flex flex-col items-center justify-center gap-2">
        <LottieView style={{ width: 150, height: 150 }} source={SplashLottie} autoPlay loop />

        <Text className="text-4xl font-extrabold text-brand">On Time</Text>
        <Text className="text-base text-muted dark:text-muted-dark">시간을 지키는 가장 쉬운 방법</Text>
      </View>

      <View className="w-[80%]">
        <Button
          label={isLoggingIn ? '로그인 중' : '로그인'}
          disabled={isLoggingIn}
          onPress={() => {
            promptAsync();
          }}
          icon={
            isLoggingIn ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <MaterialIcons name="login" size={20} color="#000000" />
            )
          }
        />
      </View>
    </View>
  );
}
