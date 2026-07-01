import { View } from 'react-native';

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <View
      className={`border-border bg-surface dark:border-border-dark dark:bg-surface-dark rounded-3xl border p-5 ${className}`}
    >
      {children}
    </View>
  );
}
