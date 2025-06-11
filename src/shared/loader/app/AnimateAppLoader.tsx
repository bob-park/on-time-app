import { useContext, useEffect, useRef, useState } from 'react';

import { Animated, Text, View } from 'react-native';

import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';

import SplashLottie from '@/assets/lotties/splash-lottie.json';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import delay from '@/utils/delay';

import cx from 'classnames';
import LottieView from 'lottie-react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AnimatedSplashScreen({ children }: Readonly<{ children: React.ReactNode }>) {
  // ref
  const animation = useRef<Animated.Value>(new Animated.Value(1)).current;

  // state
  const [isAppReady, setIsAppReady] = useState<boolean>(false);

  // useEffect
  useEffect(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 2_000,
      useNativeDriver: true,
    }).start(() => setIsAppReady(true));
  }, []);

  return (
    <View className="flex-1">
      {isAppReady ? (
        children
      ) : (
        <Animated.View
          className={cx('flex size-full flex-col items-center justify-center bg-white dark:bg-black')}
          style={{ opacity: animation }}
          pointerEvents="none"
        >
          <LottieView style={{ width: 150, height: 150 }} source={SplashLottie} autoPlay loop />

          <View className="">
            <Text className="text-4xl font-bold text-blue-500 dark:text-blue-300">On Time</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

export default function AnimateAppLoader({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [isSplashReady, setIsSplashReady] = useState<boolean>(false);

  // useEffect
  useEffect(() => {
    async function prepare() {
      await SplashScreen.hideAsync();

      await delay(1_000);

      setIsSplashReady(true);
    }

    prepare();
  }, []);

  if (!isSplashReady) {
    return null;
  }

  return <AnimatedSplashScreen>{children}</AnimatedSplashScreen>;
}
