import { useContext } from 'react';

import { ScrollView, Text, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { useRouter } from 'expo-router';

import UserAvatar from '@/domain/users/components/avatar/UserAvatar';
import { useUser } from '@/domain/users/queries/users';
import { useUserEmployment } from '@/domain/users/queries/usersEmployments';
import { Icon } from '@/shared/components/Icon';
import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { enterHero, enterPage } from '@/shared/components/motion/entering';
import { Card, SectionHeader } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

const DEFAULT_API_HOST = process.env.EXPO_PUBLIC_API_HOST;

const BRAND = '#1ed760';
const MUTED = '#8a8f99';

type SettingRowProps = {
  icon: React.ReactNode;
  label: string;
  tone?: 'default' | 'danger';
  move?: boolean;
  onPress?: () => void;
};

function SettingRow({ icon, label, tone = 'default', move = false, onPress }: SettingRowProps) {
  return (
    <AnimatedPressable
      className="flex-row items-center gap-3 px-4 py-3.5"
      onPress={onPress}
      disabled={!onPress}
      scaleTo={0.98}
    >
      {/* icon */}
      <View className="bg-elevated dark:bg-elevated-dark size-9 flex-none items-center justify-center rounded-xl">
        {icon}
      </View>

      {/* label */}
      <Text
        className={`flex-1 text-[15px] font-semibold ${
          tone === 'danger' ? 'text-danger dark:text-danger-dark' : 'text-content dark:text-content-dark'
        }`}
      >
        {label}
      </Text>

      {/* chevron */}
      {move && <Icon sf="chevron.right" fallback="›" size={14} color={MUTED} weight="semibold" />}
    </AnimatedPressable>
  );
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return (
    <View className="border-border bg-surface dark:border-border-dark dark:bg-surface-dark overflow-hidden rounded-3xl border">
      {children}
    </View>
  );
}

function RowDivider() {
  return <View className="border-border dark:border-border-dark ml-[60px] border-b" />;
}

export default function MoreIndex() {
  // context
  const { userinfo, onLogout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  // theme-conditional danger (matches --color-danger / --color-danger-dark)
  const dangerColor = theme === 'light' ? '#e0455a' : '#f3727f';

  // queries
  const { user } = useUser(userinfo?.sub);
  const { employment } = useUserEmployment(userinfo?.sub);

  // handle
  const handleLogout = () => {
    onLogout();
  };

  return (
    <ScrollView
      className="size-full"
      contentContainerStyle={{ paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      {/* section header */}
      <Reanimated.View entering={enterPage(0)} className="mb-4">
        <SectionHeader title="프로필" />
      </Reanimated.View>

      {/* Profile Card */}
      <Reanimated.View entering={enterHero(60)}>
        <Card className="p-5">
          <View className="flex flex-row items-center gap-4">
            {/* avatar */}
            <View className="flex-none">
              <UserAvatar
                src={`${DEFAULT_API_HOST}/api/v1/users/${userinfo?.sub}/avatar`}
                username={user?.username}
                size="sm"
              />
            </View>

            {/* info */}
            <View className="flex flex-1 flex-col gap-1">
              <Text className="text-content dark:text-content-dark text-xl font-bold">{user?.username}</Text>

              <Text className="text-muted dark:text-muted-dark text-sm font-semibold">
                {user?.position?.name}
                {user?.group?.teamUserDescription ? ` (${user?.group?.teamUserDescription})` : ''}
              </Text>

              <View className="mt-1 flex flex-row items-center gap-2">
                <View className="bg-elevated dark:bg-elevated-dark rounded-full px-2.5 py-1">
                  <Text className="text-muted dark:text-muted-dark text-xs">
                    {user?.group?.name} ·{' '}
                    {employment?.effectiveDate
                      ? dayjs
                          .duration((dayjs().startOf('day').unix() - dayjs(employment.effectiveDate).unix()) * 1_000)
                          .format('Y년 M개월 D일')
                      : ''}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </Reanimated.View>

      {/* Menu Groups */}
      <View className="mt-10 flex flex-col gap-8">
        {/* 계정 */}
        <Reanimated.View entering={enterPage(160)} className="flex flex-col gap-3">
          <SectionHeader title="계정" />
          <SettingsGroup>
            <SettingRow
              label="로그아웃"
              tone="danger"
              icon={<Icon sf="rectangle.portrait.and.arrow.forward" fallback="↩" size={18} color={dangerColor} />}
              onPress={handleLogout}
            />
            <RowDivider />
            <SettingRow
              label="알림 설정"
              move
              icon={<Icon sf="bell" fallback="🔔" size={18} color={BRAND} />}
              onPress={() => router.push('./notifications')}
            />
          </SettingsGroup>
        </Reanimated.View>

        {/* 설정 */}
        <Reanimated.View entering={enterPage(240)} className="flex flex-col gap-3">
          <SectionHeader title="설정" />
          <SettingsGroup>
            <SettingRow
              label="화면 테마"
              move
              icon={<Icon sf="sun.max" fallback="☀" size={18} color={BRAND} />}
              onPress={() => router.push('./theme')}
            />
          </SettingsGroup>
        </Reanimated.View>

        {/* 더보기 */}
        <Reanimated.View entering={enterPage(320)} className="flex flex-col gap-3">
          <SectionHeader title="더보기" />
          <SettingsGroup>
            <SettingRow move label="공지사항" icon={<Icon sf="newspaper" fallback="📰" size={18} color={BRAND} />} />
            <RowDivider />
            <SettingRow move label="근무" icon={<Icon sf="timer" fallback="⏱" size={18} color={BRAND} />} />
            <RowDivider />
            <SettingRow move label="구성원" icon={<Icon sf="person.2" fallback="👥" size={18} color={BRAND} />} />
          </SettingsGroup>
        </Reanimated.View>
      </View>
    </ScrollView>
  );
}
