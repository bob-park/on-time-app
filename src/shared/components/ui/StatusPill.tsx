import { Text, View } from 'react-native';

const TONE = {
  brand: 'text-brand',
  danger: 'text-danger dark:text-danger-dark',
  muted: 'text-muted dark:text-muted-dark',
} as const;

const DOT = {
  brand: 'bg-brand',
  danger: 'bg-danger dark:bg-danger-dark',
  muted: 'bg-muted dark:bg-muted-dark',
} as const;

export function StatusPill({ label, tone = 'brand' }: { label: string; tone?: keyof typeof TONE; pulse?: boolean }) {
  return (
    <View className="bg-elevated dark:bg-elevated-dark flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1">
      <View className={`size-2 rounded-full ${DOT[tone]}`} />
      <Text className={`text-xs font-bold ${TONE[tone]}`}>{label}</Text>
    </View>
  );
}
