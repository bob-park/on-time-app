import { useContext } from 'react';

import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Icon } from '@/shared/components/Icon';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: {
    elevation: 2,
  },
});

type ThemeOption = {
  key: 'light' | 'dark' | 'system';
  label: string;
  sf: string;
  fallback: string;
  iconColor: string;
  iconBg: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  { key: 'light', label: '밝은 모드', sf: 'sun.max', fallback: '☀', iconColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)' },
  { key: 'dark', label: '어두운 모드', sf: 'moon', fallback: '🌙', iconColor: '#6366f1', iconBg: 'rgba(99,102,241,0.12)' },
  { key: 'system', label: '시스템 설정과 같이', sf: 'circle.lefthalf.filled', fallback: '◐', iconColor: '#6b7280', iconBg: 'rgba(107,114,128,0.12)' },
];

export default function Theme() {
  // context
  const { preference, onUpdatePreference } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  return (
    <ScrollView
      className="size-full"
      contentContainerStyle={{ paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <View className="relative mb-6 flex flex-row items-center justify-center">
        <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
          <Icon sf="chevron.left" fallback="‹" size={24} weight="semibold" />
        </TouchableOpacity>
        <Text className="text-xl font-bold dark:text-white">화면 테마</Text>
      </View>

      {/* theme options card */}
      <View className="mt-4 overflow-hidden rounded-2xl bg-white dark:bg-gray-900" style={CARD_SHADOW}>
        {THEME_OPTIONS.map((option, index) => (
          <View key={option.key}>
            <TouchableOpacity
              className={`flex flex-row items-center gap-3 px-4 py-4 ${
                preference === option.key ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onPress={() => onUpdatePreference(option.key)}
            >
              {/* icon */}
              <View
                className="size-9 flex-none items-center justify-center rounded-xl"
                style={{ backgroundColor: option.iconBg }}
              >
                <Icon sf={option.sf} fallback={option.fallback} size={18} color={option.iconColor} />
              </View>

              {/* label */}
              <Text className="flex-1 text-[15px] font-semibold dark:text-white">{option.label}</Text>

              {/* checkmark */}
              {preference === option.key && (
                <Icon sf="checkmark.circle.fill" fallback="✓" size={22} color="#007AFF" />
              )}
            </TouchableOpacity>

            {index < THEME_OPTIONS.length - 1 && (
              <View className="ml-[60px] border-b border-gray-100 dark:border-gray-800" />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
