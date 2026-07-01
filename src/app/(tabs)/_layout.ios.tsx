import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useColorScheme } from 'nativewind';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';

  return (
    <NativeTabs
      backBehavior="history"
      tintColor="#1ed760"
      iconColor={isDark ? 'rgba(255,255,255,0.5)' : '#8a8f99'}
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
