import { useContext } from 'react';

import { View } from 'react-native';

import { Stack } from 'expo-router';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

export default function MoreLayout() {
  // context
  const { theme } = useContext(ThemeContext);

  return (
    <View className="flex size-full bg-white p-3 dark:bg-black">
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme === 'light' ? 'white' : 'black' } }}
      />
    </View>
  );
}
