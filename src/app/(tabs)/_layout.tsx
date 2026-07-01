import { useContext } from 'react';

import { Tabs } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

export default function TabLayout() {
  const { theme } = useContext(ThemeContext);

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1ed760',
        tabBarInactiveTintColor: theme === 'light' ? '#8a8f99' : 'rgba(255,255,255,0.5)',
        tabBarLabelStyle: { fontSize: 10 },
        tabBarStyle: {
          backgroundColor: theme === 'light' ? '#ffffff' : '#181818',
          borderTopColor: theme === 'light' ? '#e6e6ea' : '#282828',
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
