import { useContext } from 'react';

import { View } from 'react-native';

import { Stack } from 'expo-router';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

export default function HomeLayout() {
  // context
  const { theme } = useContext(ThemeContext);

  return (
    <View className="flex size-full bg-white dark:bg-black">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 12,
            paddingBottom: 46,
            backgroundColor: theme === 'light' ? 'white' : 'black',
          },
        }}
      />
    </View>
  );
}
