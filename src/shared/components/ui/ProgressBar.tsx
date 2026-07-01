import { View } from 'react-native';

export function ProgressBar({ progress, tone = 'brand' }: { progress: number; tone?: 'brand' | 'danger' }) {
  const clamped = Math.min(Math.max(progress, 0), 100);

  return (
    <View className="bg-elevated dark:bg-elevated-dark h-1.5 overflow-hidden rounded-full">
      <View
        className={`h-full rounded-full ${tone === 'brand' ? 'bg-brand' : 'bg-danger dark:bg-danger-dark'}`}
        style={{ width: `${clamped}%` }}
      />
    </View>
  );
}
