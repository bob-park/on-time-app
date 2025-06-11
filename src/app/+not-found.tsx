import { Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

export default function NotFound() {
  // hooks
  const router = useRouter();

  return (
    <View className="flex size-full flex-col items-center justify-center">
      <Text>Not Found</Text>

      <TouchableOpacity className="mt-20 w-32 rounded-2xl" onPress={() => router.back()}>
        <Text className="text-2xl text-sky-600">Go to Back</Text>
      </TouchableOpacity>
    </View>
  );
}
