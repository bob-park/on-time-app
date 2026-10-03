import { View } from 'react-native';

import { Stack } from 'expo-router';

import { usePalette } from '@/shared/components/ui';

export default function MoreLayout() {
  const palette = usePalette();

  return (
    <View className="bg-base dark:bg-base-dark flex size-full">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 68,
            paddingBottom: 12,
            backgroundColor: palette.base,
          },
        }}
      />
    </View>
  );
}
