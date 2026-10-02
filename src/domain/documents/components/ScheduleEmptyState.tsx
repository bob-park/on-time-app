import { Text, View } from 'react-native';

import { Icon } from '@/shared/components/Icon';
import { usePalette } from '@/shared/components/ui';

export default function ScheduleEmptyState({ message }: { message: string }) {
  const palette = usePalette();

  return (
    <View className="items-center py-8">
      <View className="bg-elevated dark:bg-elevated-dark mb-3 size-14 items-center justify-center rounded-full">
        <Icon sf="calendar" fallback="📅" size={24} color={palette.muted} />
      </View>
      <Text className="text-muted dark:text-muted-dark text-sm font-medium">{message}</Text>
    </View>
  );
}
