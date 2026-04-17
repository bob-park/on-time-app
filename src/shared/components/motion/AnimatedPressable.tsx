import { forwardRef } from 'react';

import { Pressable, PressableProps, View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

const EASE_OUT_QUART = Easing.bezier(0.25, 1, 0.5, 1);

type Props = PressableProps & {
  /** Scale target when pressed. Default 0.97. */
  scaleTo?: number;
  children?: React.ReactNode;
};

/**
 * Pressable with a subtle scale-down feedback. Uses transform (GPU-accelerated).
 * Respects reduced motion via Reanimated v4's automatic handling.
 */
export const AnimatedPressable = forwardRef<View, Props>(function AnimatedPressable(
  { scaleTo = 0.97, onPressIn, onPressOut, style, children, ...rest },
  ref,
) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      ref={ref as never}
      style={[animatedStyle, style as never]}
      onPressIn={(e) => {
        scale.value = withTiming(scaleTo, { duration: 120, easing: EASE_OUT_QUART });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: 180, easing: EASE_OUT_QUART });
        onPressOut?.(e);
      }}
      {...rest}
    >
      {children as never}
    </AnimatedPressableBase>
  );
});
