import { View } from 'react-native';

import { Slot } from 'expo-router';

export default function HomeLayout() {
  return (
    <View className="flex size-full p-3">
      <Slot />
    </View>
  );
}
