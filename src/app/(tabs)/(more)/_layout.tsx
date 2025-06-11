import { View } from 'react-native';

import { Slot } from 'expo-router';

export default function MoreLayout() {
  return (
    <View className="flex size-full bg-white p-3">
      <Slot />
    </View>
  );
}
