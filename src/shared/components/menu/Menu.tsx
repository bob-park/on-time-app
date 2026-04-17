import { Children } from 'react';

import { Platform, Text, View } from 'react-native';

import { Icon } from '@/shared/components/Icon';
import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: {
    elevation: 2,
  },
});

export default function Menu({ title, children }: Readonly<{ title: string; children?: React.ReactNode }>) {
  const validChildren = Children.toArray(children).filter(Boolean);

  return (
    <View className="flex flex-col gap-3">
      {/* section title */}
      <Text className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {title}
      </Text>

      {/* card container */}
      <View className="overflow-hidden rounded-2xl bg-white dark:bg-gray-900" style={CARD_SHADOW}>
        {validChildren.map((child, index) => (
          <View key={index}>
            {child}
            {index < validChildren.length - 1 && (
              <View className="ml-[60px] border-b border-gray-100 dark:border-gray-800" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export function MenuItem({
  icon,
  iconBg,
  text,
  move = false,
  onPress,
}: Readonly<{
  icon?: React.ReactNode;
  iconBg?: string;
  text: string;
  move?: boolean;
  onPress?: () => void;
}>) {
  // handle
  const handlePress = () => {
    onPress && onPress();
  };

  return (
    <AnimatedPressable
      className="flex flex-row items-center gap-3 px-4 py-3.5"
      onPress={handlePress}
      disabled={!onPress}
      scaleTo={0.98}
    >
      {/* icon container */}
      {icon && (
        <View
          className="size-9 flex-none items-center justify-center rounded-xl"
          style={iconBg ? { backgroundColor: iconBg } : undefined}
        >
          {icon}
        </View>
      )}

      {/* text */}
      <Text className="flex-1 text-[15px] font-semibold dark:text-white">{text}</Text>

      {/* chevron */}
      {move && <Icon sf="chevron.right" fallback="›" size={14} color="#9ca3af" weight="semibold" />}
    </AnimatedPressable>
  );
}
