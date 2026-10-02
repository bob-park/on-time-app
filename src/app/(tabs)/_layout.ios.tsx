import { NativeTabs } from 'expo-router/native-tabs';

import { usePalette } from '@/shared/components/ui';

export default function TabLayout() {
  const palette = usePalette();

  return (
    <NativeTabs
      backBehavior="history"
      tintColor={palette.brand}
      iconColor={palette.muted}
      labelStyle={{
        default: { fontSize: 10 },
        selected: { fontSize: 10, fontWeight: '700' },
      }}
    >
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          drawable="custom_android_drawable"
        />
        <NativeTabs.Trigger.Label>오늘</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar' }}
          drawable="custom_android_drawable"
        />
        <NativeTabs.Trigger.Label>일정</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(more)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'ellipsis.circle', selected: 'ellipsis.circle.fill' }}
          drawable="custom_android_drawable"
        />
        <NativeTabs.Trigger.Label>더보기</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
