import { useContext } from 'react';

import { Platform, ScrollView, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import UserAvatar from '@/domain/users/components/avatar/UserAvatar';
import { useUserEmployment } from '@/domain/users/queries/usersEmployments';
import { Icon } from '@/shared/components/Icon';
import Menu, { MenuItem } from '@/shared/components/menu/Menu';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

const DEFAULT_API_HOST = process.env.EXPO_PUBLIC_API_HOST;

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

export default function MoreIndex() {
  // context
  const { userDetail: user, onLogout } = useContext(AuthContext);

  // hooks
  const router = useRouter();

  // queries
  const { employment } = useUserEmployment(user?.id);

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
      <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        프로필
      </Text>

      {/* Profile Card */}
      <View className="overflow-hidden rounded-3xl bg-white dark:bg-gray-900" style={CARD_SHADOW}>
        <View className="flex flex-row items-center gap-4 p-5">
          {/* avatar */}
          <View className="flex-none">
            <UserAvatar
              src={`${DEFAULT_API_HOST}/api/v1/users/${user?.id}/avatar`}
              username={user?.username}
              size="sm"
            />
          </View>

          {/* info */}
          <View className="flex flex-1 flex-col gap-1">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">{user?.username}</Text>

            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {user?.position?.name}
              {user?.group?.teamUserDescription ? ` (${user?.group?.teamUserDescription})` : ''}
            </Text>

            <View className="mt-1 flex flex-row items-center gap-2">
              <View className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/10">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
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
      </View>

      {/* Menu Groups */}
      <View className="mt-10 flex flex-col gap-8">
        {/* 계정 */}
        <Menu title="계정">
          <MenuItem
            text="로그아웃"
            iconBg="rgba(239,68,68,0.12)"
            icon={<Icon sf="rectangle.portrait.and.arrow.forward" fallback="↩" size={18} color="#ef4444" />}
            onPress={handleLogout}
          />
          <MenuItem
            text="알림 설정"
            move
            iconBg="rgba(59,130,246,0.12)"
            icon={<Icon sf="bell" fallback="🔔" size={18} color="#3b82f6" />}
            onPress={() => router.push('./notifications')}
          />
        </Menu>

        {/* 설정 */}
        <Menu title="설정">
          <MenuItem
            move
            text="화면 테마"
            iconBg="rgba(245,158,11,0.12)"
            icon={<Icon sf="sun.max" fallback="☀" size={18} color="#f59e0b" />}
            onPress={() => router.push('./theme')}
          />
        </Menu>

        {/* 더보기 */}
        <Menu title="더보기">
          <MenuItem
            move
            text="공지사항"
            iconBg="rgba(99,102,241,0.12)"
            icon={<Icon sf="newspaper" fallback="📰" size={18} color="#6366f1" />}
          />
          <MenuItem
            move
            text="근무"
            iconBg="rgba(59,130,246,0.08)"
            icon={<Icon sf="timer" fallback="⏱" size={18} color="#3b82f6" />}
          />
          <MenuItem
            move
            text="구성원"
            iconBg="rgba(168,85,247,0.12)"
            icon={<Icon sf="person.2" fallback="👥" size={18} color="#a855f7" />}
          />
        </Menu>
      </View>
    </ScrollView>
  );
}
