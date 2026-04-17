import { useContext } from 'react';

import { Platform } from 'react-native';

import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Ionicons } from '@expo/vector-icons';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

function AndroidTabs({ theme }: { theme: string }) {
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

function IOSTabs({ theme }: { theme: string }) {
  return (
    <NativeTabs
      backBehavior="history"
      iconColor={theme === 'light' ? '#000000' : '#ffffff'}
      labelStyle={{
        default: { fontSize: 10 },
        selected: { fontSize: 10, fontWeight: '900' },
      }}
    >
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'menubar.rectangle', selected: 'menubar.dock.rectangle' }}
          drawable="custom_android_drawable"
        />
        <NativeTabs.Trigger.Label>오늘</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar.and.person' }}
          drawable="custom_android_drawable"
        />
        <NativeTabs.Trigger.Label>일정</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="todo">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'checkmark.circle', selected: 'checkmark.circle.fill' }}
          drawable="custom_android_drawable"
        />
        <NativeTabs.Trigger.Label>할일</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(more)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'circle.grid.2x2', selected: 'circle.grid.2x2.fill' }}
          drawable="custom_android_drawable"
        />
        <NativeTabs.Trigger.Label>더보기</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabLayout() {
  const { theme } = useContext(ThemeContext);

  if (Platform.OS === 'ios') {
    return <IOSTabs theme={theme} />;
  }

  return <AndroidTabs theme={theme} />;
}
