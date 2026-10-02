import { Text } from 'react-native';

import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';

export function ChoiceChip({
  label,
  selected,
  onPress,
  icon,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <AnimatedPressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled || selected}
      onPress={onPress}
      className={`min-h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border-[1.5px] px-2 ${
        selected ? 'border-brand bg-brand-subtle dark:border-brand-dark' : 'border-border dark:border-border-dark'
      } ${disabled && !selected ? 'opacity-50' : ''}`}
    >
      {icon}
      <Text
        className={`text-[13px] font-semibold ${selected ? 'text-brand dark:text-brand-dark' : 'text-content dark:text-content-dark'}`}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
