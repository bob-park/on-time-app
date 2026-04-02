import { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

function SkeletonBlock({
  width,
  height,
  rounded = 8,
}: {
  width: number | `${number}%`;
  height: number;
  rounded?: number;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View className="bg-gray-200 dark:bg-gray-700" style={{ width, height, borderRadius: rounded, opacity }} />
  );
}

function MyScheduleSkeleton() {
  return (
    <View
      className="flex-row items-center gap-3 rounded-2xl bg-white p-4 dark:bg-gray-900"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 }}
    >
      <SkeletonBlock width={48} height={48} rounded={14} />
      <View className="flex-1 gap-2">
        <SkeletonBlock width={100} height={16} rounded={6} />
        <SkeletonBlock width={180} height={12} rounded={6} />
      </View>
    </View>
  );
}

function ColleagueSkeleton() {
  return (
    <View
      className="flex-row items-center gap-3 rounded-2xl bg-white p-4 dark:bg-gray-900"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 }}
    >
      <SkeletonBlock width={44} height={44} rounded={22} />
      <View className="flex-1 gap-2">
        <SkeletonBlock width={80} height={14} rounded={6} />
        <SkeletonBlock width={120} height={11} rounded={6} />
        <SkeletonBlock width={160} height={12} rounded={6} />
      </View>
      <SkeletonBlock width={40} height={22} rounded={8} />
    </View>
  );
}

export default function ScheduleSkeleton({
  variant,
  count,
}: {
  variant: 'my' | 'colleague';
  count: number;
}) {
  const Component = variant === 'my' ? MyScheduleSkeleton : ColleagueSkeleton;

  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={`skeleton-${variant}-${i}`} />
      ))}
    </View>
  );
}
