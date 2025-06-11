import { Text, TouchableOpacity, View } from 'react-native';

import { Entypo } from '@expo/vector-icons';

export default function Menu({ title, children }: Readonly<{ title: string; children?: React.ReactNode }>) {
  return (
    <View className="flex flex-col items-center gap-3">
      {/* menu title */}
      <View className="ml-8 w-full">
        <Text className="text-sm font-bold text-gray-400">{title}</Text>
      </View>

      {/* menu items */}
      <View className="flex w-full flex-col gap-5">{children}</View>
    </View>
  );
}

export function MenuItem({
  icon,
  text,
  move = false,
  onPress,
}: Readonly<{ icon?: React.ReactNode; move?: boolean; text: string; onPress?: () => void }>) {
  // handle
  const handlePress = () => {
    onPress && onPress();
  };

  return (
    <View className="w-full">
      <TouchableOpacity className="flex flex-row items-center justify-between gap-2 px-5 py-3" onPress={handlePress}>
        <View className="flex flex-row items-center gap-3">
          <View className="w-8 flex-none">{icon}</View>
          <Text className="text-lg font-semibold text-gray-500">{text}</Text>
        </View>

        {move && (
          <View className="mr-4">
            <Entypo name="chevron-right" size={24} color="gray" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
