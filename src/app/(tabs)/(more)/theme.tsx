import { useContext } from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { useRouter } from 'expo-router';

import { Icon } from '@/shared/components/Icon';
import { enterPage } from '@/shared/components/motion/entering';
import { ListGroup, ListItem, usePalette } from '@/shared/components/ui';
import { ThemeContext, type ThemePreference } from '@/shared/providers/theme/ThemeProvider';

const THEME_OPTIONS: { key: ThemePreference; label: string; description: string }[] = [
  { key: 'system', label: '시스템 설정과 같이', description: '기기 설정에 맞춰 자동 전환' },
  { key: 'light', label: '밝은 모드', description: '항상 밝은 화면 사용' },
  { key: 'dark', label: '어두운 모드', description: '항상 어두운 화면 사용' },
];

export default function Theme() {
  // context
  const { theme, onUpdateTheme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();
  const palette = usePalette();

  return (
    <ScrollView
      className="size-full"
      contentContainerStyle={{ paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      <Reanimated.View entering={enterPage(0)} className="relative mb-6 flex flex-row items-center justify-center">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          className="absolute left-0 size-11 items-start justify-center"
          onPress={() => router.back()}
        >
          <Icon sf="chevron.left" fallback="‹" size={22} weight="semibold" color={palette.content} />
        </TouchableOpacity>
        <Text className="text-content dark:text-content-dark text-xl font-bold">화면 테마</Text>
      </Reanimated.View>

      <Reanimated.View entering={enterPage(80)}>
        <ListGroup>
          {THEME_OPTIONS.map((option) => (
            <ListItem
              key={option.key}
              label={option.label}
              sub={option.description}
              onPress={() => onUpdateTheme(option.key)}
              right={
                theme === option.key ? (
                  <Icon sf="checkmark" fallback="✓" size={16} weight="semibold" color={palette.brand} />
                ) : (
                  <View className="size-4" />
                )
              }
            />
          ))}
        </ListGroup>
      </Reanimated.View>
    </ScrollView>
  );
}
