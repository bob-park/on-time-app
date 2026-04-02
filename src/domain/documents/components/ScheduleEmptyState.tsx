import { Text, View } from 'react-native';

import { Icon } from '@/shared/components/Icon';

export default function ScheduleEmptyState({ message }: { message: string }) {
  return (
    <View className="items-center py-8">
      <View className="mb-3 size-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon sf="calendar" fallback="📅" size={24} color="#9CA3AF" />
      </View>
      <Text className="text-sm font-medium text-gray-400 dark:text-gray-500">{message}</Text>
    </View>
  );
}
