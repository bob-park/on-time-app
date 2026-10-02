import { Text } from 'react-native';

import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';

type Variant = 'primary' | 'secondary' | 'subtle';

const VARIANT: Record<Variant, { box: string; text: string }> = {
  primary: { box: 'bg-brand', text: 'text-white' },
  secondary: {
    box: 'bg-elevated dark:bg-elevated-dark',
    text: 'text-content dark:text-content-dark',
  },
  subtle: { box: 'bg-brand-subtle', text: 'text-brand dark:text-brand-dark' },
};

export function Button({
  variant = 'primary',
  label,
  onPress,
  disabled,
  icon,
}: {
  variant?: Variant;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  const v = VARIANT[variant];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3.5 ${v.box} ${disabled ? 'opacity-50' : ''}`}
    >
      {icon}
      <Text className={`text-[16px] font-semibold ${v.text}`}>{label}</Text>
    </AnimatedPressable>
  );
}
