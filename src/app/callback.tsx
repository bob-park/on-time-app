import { ActivityIndicator, Text, View } from 'react-native';

import { usePalette } from '@/shared/components/ui';

export default function Callback() {
  const palette = usePalette();

  return (
    <View className="bg-base dark:bg-base-dark flex size-full flex-col items-center justify-center gap-4">
      <ActivityIndicator size="large" color={palette.brand} />
      <Text className="text-muted dark:text-muted-dark text-[16px]">로그인 처리 중...</Text>
    </View>
  );
}
