import { View, ViewProps } from 'react-native';

// Kraken "whisper" shadow. 다크 모드에서는 배경 대비로 사실상 보이지 않는다.
const SHADOW = { boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.03), 0px 1px 4px rgba(16, 24, 40, 0.04)' } as const;

export function Card({
  className = '',
  style,
  children,
}: {
  className?: string;
  style?: ViewProps['style'];
  children: React.ReactNode;
}) {
  return (
    <View className={`bg-surface dark:bg-surface-dark rounded-2xl ${className}`} style={[SHADOW, style]}>
      {children}
    </View>
  );
}
