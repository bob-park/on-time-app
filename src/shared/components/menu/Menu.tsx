import { Text, TouchableOpacity, View } from 'react-native';

export default function Menu({ title, children }: Readonly<{ title: string; children?: React.ReactNode }>) {
  return (
    <View className="flex flex-col items-center gap-3">
      {/* menu title */}
      <View className="w-full">
        <Text className="text-lg font-bold text-gray-400">{title}</Text>
      </View>

      {/* menu items */}
      <View className="flex w-full flex-col gap-3">{children}</View>
    </View>
  );
}

export function MenuItem({
  icon,
  text,
  onPress,
}: Readonly<{ icon?: React.ReactNode; text: string; onPress?: () => void }>) {
  // handle
  const handlePress = () => {
    onPress && onPress();
  };

  return (
    <View className="w-full">
      <TouchableOpacity className="flex flex-row items-center gap-2 px-5 py-2" onPress={handlePress}>
        {icon}

        <Text className="text-xl font-semibold text-gray-500">{text}</Text>
      </TouchableOpacity>
    </View>
  );
}
