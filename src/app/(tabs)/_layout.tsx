import { useContext, useEffect, useRef, useState } from 'react';

import { Animated, Pressable } from 'react-native';

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

function AnimatedTabBarButton({ children, onPress, style, ...restProps }: BottomTabBarButtonProps) {
  // state
  const [pressCount, setPressCount] = useState<number>(0);

  // ref
  const scaleValue = useRef(new Animated.Value(1)).current;

  // hooks
  const router = useRouter();

  // useEffect
  useEffect(() => {
    if (pressCount > 4) {
      router.push('/magical-conch');
      setPressCount(0);
      return;
    }

    const timeoutId = setTimeout(() => {
      setPressCount(0);
    }, 1_000);

    return () => {
      timeoutId && clearTimeout(timeoutId);
    };
  }, [pressCount]);

  // handle
  const handlePressOut = () => {
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 200,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 200,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={(e) => {
        onPress && onPress(e);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        setPressCount(pressCount + 1);
      }}
      onPressOut={handlePressOut}
      style={[style]}
      android_ripple={{ borderless: false, radius: 0 }}
    >
      <Animated.View className="items-center justify-center" style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  // context
  const { theme } = useContext(ThemeContext);

  return (
    <NativeTabs
      backBehavior="history"
      iconColor={theme === 'light' ? '#000000' : '#ffffff'}
      labelStyle={{
        default: { fontSize: 10 },
        selected: { fontSize: 10, fontWeight: '900' },
      }}
    >
      <NativeTabs.Trigger
        name="(home)"
        options={{
          icon: { sf: 'menubar.rectangle', drawable: 'custom_android_drawable' },
          selectedIcon: { sf: 'menubar.dock.rectangle', drawable: 'custom_android_drawable' },
        }}
      >
        <Label>오늘</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="schedule"
        options={{
          icon: { sf: 'calendar', drawable: 'custom_android_drawable' },
          selectedIcon: { sf: 'calendar.and.person', drawable: 'custom_android_drawable' },
        }}
      >
        <Label>일정</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="todo"
        options={{
          icon: { sf: 'checkmark.circle', drawable: 'custom_android_drawable' },
          selectedIcon: { sf: 'checkmark.circle.fill', drawable: 'custom_android_drawable' },
        }}
      >
        <Label>할일</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="(more)"
        options={{
          icon: { sf: 'circle.grid.2x2', drawable: 'custom_android_drawable' },
          selectedIcon: { sf: 'circle.grid.2x2.fill', drawable: 'custom_android_drawable' },
        }}
      >
        <Label>더보기</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
