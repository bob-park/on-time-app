import { Text, View } from 'react-native';

export function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View className="border-border bg-surface dark:border-border-dark dark:bg-surface-dark flex-1 rounded-2xl border p-4">
      <Text className="text-muted dark:text-muted-dark text-xs font-semibold">{label}</Text>
      <Text
        className={`mt-1 text-xl font-extrabold ${accent ? 'text-brand' : 'text-content dark:text-content-dark'}`}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
    </View>
  );
}
