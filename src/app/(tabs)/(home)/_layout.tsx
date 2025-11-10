import { useContext } from 'react';

import { View } from 'react-native';

import { Stack } from 'expo-router';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

export default function HomeLayout() {
  // context
  const { theme } = useContext(ThemeContext);

  return (
    <View className="flex size-full bg-gray-50 dark:bg-gray-950">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 68,
            paddingBottom: 2,
            backgroundColor: theme === 'light' ? '#f9fafb' : '#030712',
          },
        }}
      />
    </View>
  );
}
