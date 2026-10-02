import { Pressable, Text, View } from 'react-native';

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="bg-elevated dark:bg-elevated-dark flex-row rounded-xl p-1" accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            hitSlop={4}
            onPress={() => !selected && onChange(option.value)}
            className={`min-h-9 flex-1 items-center justify-center rounded-[10px] px-2 ${selected ? 'bg-surface dark:bg-surface-dark' : ''}`}
          >
            <Text
              numberOfLines={1}
              className={`text-[13px] font-semibold ${selected ? 'text-content dark:text-content-dark' : 'text-muted dark:text-muted-dark'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
