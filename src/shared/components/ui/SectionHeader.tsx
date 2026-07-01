import { Text, View } from 'react-native';

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-content dark:text-content-dark text-lg font-extrabold">{title}</Text>
      {action}
    </View>
  );
}
