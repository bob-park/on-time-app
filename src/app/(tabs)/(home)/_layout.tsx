import { useContext } from 'react';

import { View, useColorScheme } from 'react-native';

import { Stack } from 'expo-router';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

export default function HomeLayout() {
  const colorScheme = useColorScheme();

  return (
    <View className="flex size-full bg-gray-50 dark:bg-gray-950">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 68,
            paddingBottom: 12,
            backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#030712',
          },
        }}
      />
    </View>
  );
}
