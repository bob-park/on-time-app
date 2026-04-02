import { Children } from 'react';

import { Platform, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/shared/components/Icon';

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
    <View className="flex flex-col gap-2">
      {/* section title */}
      <View className="ml-1">
        <Text className="text-[13px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </Text>
      </View>

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
    <TouchableOpacity className="flex flex-row items-center gap-3 px-4 py-3.5" onPress={handlePress}>
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
      {move && <Icon sf="chevron.right" fallback="›" size={14} color="#d1d5db" weight="semibold" />}
    </TouchableOpacity>
  );
}
