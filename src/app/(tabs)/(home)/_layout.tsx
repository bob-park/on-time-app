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
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 12,
            paddingBottom: 2,
            backgroundColor: theme === 'light' ? 'white' : 'black',
          },
        }}
      />
    </View>
  );
}
