import { Text, View } from 'react-native';

const BADGE = {
  brand: { box: 'bg-brand-subtle', text: 'text-brand dark:text-brand-dark' },
  success: { box: 'bg-success-subtle', text: 'text-success-strong dark:text-success' },
  neutral: { box: 'bg-neutral-subtle', text: 'text-neutral-strong dark:text-muted-dark' },
  danger: { box: 'bg-danger-subtle', text: 'text-danger dark:text-danger-dark' },
} as const;

export type BadgeVariant = keyof typeof BADGE;

export function Badge({ label, variant = 'neutral' }: { label: string; variant?: BadgeVariant }) {
  const v = BADGE[variant];

  return (
    <View className={`self-start rounded-md px-2 py-0.5 ${v.box}`}>
      <Text className={`text-[11px] font-bold ${v.text}`}>{label}</Text>
    </View>
  );
}
