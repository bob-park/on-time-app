import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useColorScheme } from 'nativewind';

// SVG stroke props require raw color strings (NativeWind class tokens do not
// apply to react-native-svg stroke). These values mirror the @theme tokens in
// src/app/global.css: border / border-dark for the track, brand for the arc.
const TRACK_LIGHT = '#e6e6ea'; // --color-border
const TRACK_DARK = '#282828'; // --color-border-dark
const BRAND = '#1ed760'; // --color-brand

export function ProgressRing({ progress, size = 78, label }: { progress: number; size?: number; label?: string }) {
  const { colorScheme } = useColorScheme();
  const clamped = Math.min(Math.max(progress, 0), 100);

  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;
  const track = colorScheme === 'dark' ? TRACK_DARK : TRACK_LIGHT;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={BRAND}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {label != null && (
        <View className="absolute items-center justify-center">
          <Text
            className="text-content dark:text-content-dark text-base font-extrabold"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {label}
          </Text>
        </View>
      )}
    </View>
  );
}
