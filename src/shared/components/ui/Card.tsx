import { View } from 'react-native';

export function Card({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className={`rounded-3xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark ${className}`}
    >
      {children}
    </View>
  );
}
