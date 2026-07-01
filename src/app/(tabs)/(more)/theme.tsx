import { useContext } from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { useRouter } from 'expo-router';

import { Icon } from '@/shared/components/Icon';
import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { enterListItem, enterPage } from '@/shared/components/motion/entering';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

const BRAND = '#1ed760';
const MUTED = '#8a8f99';

type ThemeOption = {
  key: 'light' | 'dark' | 'system';
  label: string;
  description: string;
  sf: string;
  fallback: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'system',
    label: '시스템 설정과 같이',
    description: '기기 설정에 맞춰 자동 전환',
    sf: 'circle.lefthalf.filled',
    fallback: '◐',
  },
  {
    key: 'light',
    label: '밝은 모드',
    description: '항상 밝은 화면 사용',
    sf: 'sun.max',
    fallback: '☀',
  },
  {
    key: 'dark',
    label: '어두운 모드',
    description: '항상 어두운 화면 사용',
    sf: 'moon',
    fallback: '🌙',
  },
];

export default function Theme() {
  // context
  const { theme, onUpdateTheme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  return (
    <ScrollView
      className="size-full"
      contentContainerStyle={{ paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <Reanimated.View entering={enterPage(0)} className="relative mb-6 flex flex-row items-center justify-center">
        <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
          <Icon sf="chevron.left" fallback="‹" size={24} weight="semibold" color={MUTED} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-content dark:text-content-dark">화면 테마</Text>
      </Reanimated.View>

      {/* theme option cards */}
      <View className="mt-2 flex flex-col gap-3">
        {THEME_OPTIONS.map((option, index) => {
          const selected = theme === option.key;

          return (
            <Reanimated.View key={option.key} entering={enterListItem(index, 80)}>
              <AnimatedPressable
                scaleTo={0.98}
                className={`flex flex-row items-center gap-3 rounded-3xl border p-4 ${
                  selected
                    ? 'border-brand bg-surface dark:bg-surface-dark'
                    : 'border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
                }`}
                onPress={() => onUpdateTheme(option.key)}
              >
                {/* icon */}
                <View className="size-10 flex-none items-center justify-center rounded-2xl bg-elevated dark:bg-elevated-dark">
                  <Icon sf={option.sf} fallback={option.fallback} size={20} color={selected ? BRAND : MUTED} />
                </View>

                {/* label + description */}
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-content dark:text-content-dark">{option.label}</Text>
                  <Text className="mt-0.5 text-xs text-muted dark:text-muted-dark">{option.description}</Text>
                </View>

                {/* checkmark */}
                {selected && <Icon sf="checkmark.circle.fill" fallback="✓" size={22} color={BRAND} />}
              </AnimatedPressable>
            </Reanimated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}
