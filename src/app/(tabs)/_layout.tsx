import { useContext, useRef } from 'react';

import { Animated, Pressable, Text, View } from 'react-native';

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

import * as Haptics from 'expo-haptics';
import { Redirect, Tabs } from 'expo-router';

import { Ionicons, Octicons } from '@expo/vector-icons';

import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';

function AnimatedTabBarButton({ children, onPress, style, ...restProps }: BottomTabBarButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

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
    <View className="relative size-full bg-white dark:bg-black">
      {/* header */}
      <View className="mt-14 flex flex-col items-center justify-center gap-3"></View>

      {/* tabs */}
      <Tabs
        backBehavior="history"
        screenOptions={{
          animation: 'fade',
          headerShown: false,
          tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
          tabBarStyle: {
            borderTopColor: '#d1d5db',
            borderStyle: 'solid',
            borderTopWidth: 0.2,
            backgroundColor: theme === 'light' ? '#fff' : '#000',
          },
          tabBarLabel: ({ focused, children }) => (
            <Text
              className={cx('text-xs', {
                'font-semibold text-black dark:text-white': focused,
                'text-gray-400 dark:text-gray-300': !focused,
              })}
            >
              {children}
            </Text>
          ),
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: '오늘',
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="calendar" size={24} color={theme === 'light' ? 'black' : 'white'} />
              ) : (
                <Ionicons name="calendar-outline" size={24} color="gray" />
              ),
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: '일정',
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="menu" size={24} color={theme === 'light' ? 'black' : 'white'} />
              ) : (
                <Ionicons name="menu-outline" size={24} color="gray" />
              ),
          }}
        />
        <Tabs.Screen
          name="todo"
          options={{
            title: '할일',
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Octicons name="check-circle-fill" size={24} color={theme === 'light' ? 'black' : 'white'} />
              ) : (
                <Octicons name="check-circle" size={24} color="gray" />
              ),
          }}
        />
        <Tabs.Screen
          name="(more)"
          options={{
            title: '더보기',
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="grid" size={24} color={theme === 'light' ? 'black' : 'white'} />
              ) : (
                <Ionicons name="grid-outline" size={24} color="gray" />
              ),
          }}
        />
      </Tabs>
    </View>
  );
}
