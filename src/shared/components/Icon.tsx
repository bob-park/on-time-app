import { Platform, PlatformColor, Text } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports
let SymbolView: React.ComponentType<{ name: string; tintColor?: string | ReturnType<typeof PlatformColor>; size?: number; weight?: string }> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SymbolView = require('expo-symbols').SymbolView;
} catch { /* fallback */ }

interface IconProps {
  /** SF Symbol name */
  sf: string;
  /** Emoji / text fallback when expo-symbols unavailable */
  fallback: string;
  size?: number;
  /** Explicit color. Defaults to PlatformColor('label') on iOS, #1C1C1E on Android */
  color?: string;
  weight?: 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
}

export function Icon({ sf, fallback, size = 24, color, weight = 'regular' }: IconProps) {
  const tintColor: string | ReturnType<typeof PlatformColor> =
    color ?? (Platform.OS === 'ios' ? PlatformColor('label') : '#1C1C1E');

  if (SymbolView) {
    return <SymbolView name={sf} tintColor={tintColor} size={size} weight={weight} />;
  }

  return (
    <Text style={{ fontSize: Math.round(size * 0.85), color: color ?? '#1C1C1E', lineHeight: size }}>
      {fallback}
    </Text>
  );
}
