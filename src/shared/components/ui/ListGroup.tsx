import { Children, isValidElement } from 'react';

import { Text, View } from 'react-native';

import { Icon } from '@/shared/components/Icon';
import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { Card } from '@/shared/components/ui/Card';
import { usePalette } from '@/shared/components/ui/palette';

export function ListGroup({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <Card className="px-4">
      {items.map((child, index) => (
        <View
          key={child.key ?? index}
          className={index < items.length - 1 ? 'border-border dark:border-border-dark border-b' : ''}
        >
          {child}
        </View>
      ))}
    </Card>
  );
}

export function ListItem({
  label,
  sub,
  value,
  left,
  right,
  tone = 'default',
  onPress,
}: {
  label: string;
  sub?: string;
  value?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  tone?: 'default' | 'danger';
  onPress?: () => void;
}) {
  const palette = usePalette();

  const body = (
    <View className="min-h-12 flex-row items-center gap-3 py-3">
      {left}
      <View className="flex-1">
        <Text
          className={`text-[15px] font-semibold ${tone === 'danger' ? 'text-danger dark:text-danger-dark' : 'text-content dark:text-content-dark'}`}
        >
          {label}
        </Text>
        {sub ? <Text className="text-muted dark:text-muted-dark mt-0.5 text-xs">{sub}</Text> : null}
      </View>
      {value ? <Text className="text-muted dark:text-muted-dark text-sm">{value}</Text> : null}
      {right ??
        (onPress ? <Icon sf="chevron.right" fallback="›" size={13} weight="semibold" color={palette.muted} /> : null)}
    </View>
  );

  if (!onPress) {
    return body;
  }

  return (
    <AnimatedPressable accessibilityRole="button" scaleTo={0.98} onPress={onPress}>
      {body}
    </AnimatedPressable>
  );
}
