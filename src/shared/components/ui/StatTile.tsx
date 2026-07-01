import { Text, View } from 'react-native';

export function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
      <Text className="text-xs font-semibold text-muted dark:text-muted-dark">{label}</Text>
      <Text
        className={`mt-1 text-xl font-extrabold ${accent ? 'text-brand' : 'text-content dark:text-content-dark'}`}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
    </View>
  );
}
