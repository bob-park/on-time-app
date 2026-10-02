import { Text, View } from 'react-native';

import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { Card } from '@/shared/components/ui/Card';

const TABULAR = { fontVariant: ['tabular-nums' as const] };

export function QuickAction({
  icon,
  label,
  sub,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${sub}`}
      className="flex-1"
      onPress={onPress}
    >
      <Card className="p-3.5">
        <View className="bg-brand-subtle size-9 items-center justify-center rounded-[10px]">{icon}</View>
        <Text className="text-content dark:text-content-dark mt-2.5 text-sm font-bold">{label}</Text>
        <Text className="text-muted dark:text-muted-dark mt-0.5 text-xs" style={TABULAR}>
          {sub}
        </Text>
      </Card>
    </AnimatedPressable>
  );
}
