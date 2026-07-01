import { View } from 'react-native';

export function ProgressBar({
  progress,
  tone = 'brand',
}: {
  progress: number;
  tone?: 'brand' | 'danger';
}) {
  const clamped = Math.min(Math.max(progress, 0), 100);

  return (
    <View className="h-1.5 overflow-hidden rounded-full bg-elevated dark:bg-elevated-dark">
      <View
        className={`h-full rounded-full ${tone === 'brand' ? 'bg-brand' : 'bg-danger dark:bg-danger-dark'}`}
        style={{ width: `${clamped}%` }}
      />
    </View>
  );
}
