import { useColorScheme } from 'react-native';

import { Tabs } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1ed760',
        tabBarInactiveTintColor: isDark ? 'rgba(255,255,255,0.5)' : '#8a8f99',
        tabBarLabelStyle: { fontSize: 10 },
        tabBarStyle: {
          backgroundColor: isDark ? '#181818' : '#ffffff',
          borderTopColor: isDark ? '#282828' : '#e6e6ea',
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
