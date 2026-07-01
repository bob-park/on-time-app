import { ActivityIndicator, Text, View } from 'react-native';

export default function Callback() {
  return (
    <View className="bg-base dark:bg-base-dark flex size-full flex-col items-center justify-center gap-4">
      <ActivityIndicator size="large" color="#1ed760" />
      <Text className="text-muted dark:text-muted-dark text-base">로그인 처리 중...</Text>
    </View>
  );
}
