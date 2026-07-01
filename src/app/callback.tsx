import { ActivityIndicator, Text, View } from 'react-native';

export default function Callback() {
  return (
    <View className="flex size-full flex-col items-center justify-center gap-4 bg-base dark:bg-base-dark">
      <ActivityIndicator size="large" color="#1ed760" />
      <Text className="text-base text-muted dark:text-muted-dark">로그인 처리 중...</Text>
    </View>
  );
}
