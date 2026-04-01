import { useContext } from 'react';

import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

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
