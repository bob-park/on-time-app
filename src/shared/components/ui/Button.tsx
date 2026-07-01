import { Text } from 'react-native';

import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';

type Variant = 'primary' | 'secondary' | 'outline';

const VARIANT: Record<Variant, { box: string; text: string }> = {
  primary: { box: 'bg-brand', text: 'text-black' },
  secondary: {
    box: 'bg-elevated dark:bg-elevated-dark',
    text: 'text-content dark:text-content-dark',
  },
  outline: {
    box: 'border border-border dark:border-border-dark',
    text: 'text-content dark:text-content-dark',
  },
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
      onPress={disabled ? undefined : onPress}
      className={`flex-row items-center justify-center gap-2 rounded-full px-5 py-3.5 ${v.box} ${disabled ? 'opacity-50' : ''}`}
    >
      {icon}
      <Text className={`text-base font-extrabold ${v.text}`}>{label}</Text>
    </AnimatedPressable>
  );
}
