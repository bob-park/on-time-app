import { Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Button } from '@/shared/components/ui';

export default function NotFound() {
  // hooks
  const router = useRouter();

  return (
    <View className="bg-base dark:bg-base-dark flex size-full flex-col items-center justify-center gap-6 p-10">
      <View className="flex flex-col items-center justify-center gap-2">
        <Text className="text-content dark:text-content-dark text-6xl font-extrabold">404</Text>
        <Text className="text-muted dark:text-muted-dark text-base">페이지를 찾을 수 없습니다</Text>
      </View>

      <Button label="돌아가기" onPress={() => router.back()} />
    </View>
  );
}
