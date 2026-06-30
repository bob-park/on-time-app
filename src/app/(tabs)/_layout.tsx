import { useContext } from 'react';

import { Tabs } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

export default function TabLayout() {
  const { theme } = useContext(ThemeContext);

  const iconColor = theme === 'light' ? '#000000' : '#ffffff';

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: iconColor,
        tabBarInactiveTintColor: theme === 'light' ? '#9ca3af' : '#6b7280',
        tabBarLabelStyle: { fontSize: 10 },
        tabBarStyle: {
          backgroundColor: theme !== 'light' ? '#111111' : '#ffffff',
          borderTopColor: theme !== 'light' ? '#111111' : '#ffffff',
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: '오늘',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: '일정',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          title: '할일',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(more)"
        options={{
          title: '더보기',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'apps' : 'apps-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
