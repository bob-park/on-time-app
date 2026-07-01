import { Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Button } from '@/shared/components/ui';

export default function NotFound() {
  // hooks
  const router = useRouter();

  return (
    <View className="flex size-full flex-col items-center justify-center gap-6 bg-base p-10 dark:bg-base-dark">
      <View className="flex flex-col items-center justify-center gap-2">
        <Text className="text-6xl font-extrabold text-content dark:text-content-dark">404</Text>
        <Text className="text-base text-muted dark:text-muted-dark">페이지를 찾을 수 없습니다</Text>
      </View>

      <Button label="돌아가기" onPress={() => router.back()} />
    </View>
  );
}
