import { useContext } from 'react';

import { View } from 'react-native';

import { Stack } from 'expo-router';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

export default function MoreLayout() {
  // context
  const { theme } = useContext(ThemeContext);

  return (
    <View className="flex size-full bg-gray-50 dark:bg-gray-950">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 68,
            paddingBottom: 12,
            backgroundColor: theme === 'light' ? '#f9fafb' : '#030712',
          },
        }}
      />
    </View>
  );
}
