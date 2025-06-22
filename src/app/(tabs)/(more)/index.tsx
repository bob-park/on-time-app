import { useContext } from 'react';

import { ScrollView, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import UserAvatar from '@/domain/users/components/avatar/UserAvatar';
import { useUserEmployment } from '@/domain/users/queries/usersEmployments';
import Menu, { MenuItem } from '@/shared/components/menu/Menu';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const DEFAULT_API_HOST = process.env.EXPO_PUBLIC_API_HOST;

export default function MoreIndex() {
  // context
  const { userDetail: user, onLogout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  // queries
  const { employment } = useUserEmployment(user?.uniqueId);

  // handle
  const handleLogout = () => {
    onLogout();
  };

  return (
    <View className="flex size-full flex-col gap-3">
      {/* user */}
      <View className="w-full border-gray-200 pb-3 dark:border-gray-500" style={{ borderBottomWidth: 0.2 }}>
        <View className="flex w-full flex-row items-center gap-2">
          {/* avatar */}
          <View className="w-28 flex-none p-3">
            <UserAvatar
              src={`${DEFAULT_API_HOST}/api/v1/users/${user?.uniqueId}/avatar`}
              username={user?.username}
              size="base"
            />
          </View>

          {/* name */}
          <View className="">
            <View className="flex flex-col items-center gap-2">
              {/* name */}
              <View className="w-full">
                <Text className="text-2xl font-bold dark:text-white">{user?.username}</Text>
              </View>

              <View className="flex w-full flex-row items-center gap-1">
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">{user?.position?.name}</Text>
                {user?.team?.teamUserDescription && (
                  <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    ({user?.team?.teamUserDescription})
                  </Text>
                )}
              </View>

              <View className="flex flex-row items-center gap-3">
                {/* team - position */}
                <View className="flex flex-row items-center gap-1">
                  <Text className="font-semibold text-gray-500 dark:text-gray-400">{user?.team?.name}</Text>
                  <Text className="font-semibold text-gray-500 dark:text-gray-400">
                    <Text className="">| </Text>
                    <Text className="">
                      {dayjs
                        .duration((dayjs().startOf('day').unix() - dayjs(employment?.effectiveDate).unix()) * 1_000)
                        .format('Y년 M개월 D일')}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* menu */}
      <View className="sise-full mt-4">
        <ScrollView className="size-full">
          {/* 계정 */}
          <View className="">
            <Menu title="계정">
              <MenuItem
                text="로그아웃"
                icon={<MaterialIcons name="logout" size={24} color={theme === 'light' ? '#6b7280' : '#d1d5db'} />}
                onPress={handleLogout}
              />

              <MenuItem
                text="알림 설정"
                move
                icon={
                  <MaterialIcons
                    name="notifications-none"
                    size={24}
                    color={theme === 'light' ? '#6b7280' : '#d1d5db'}
                  />
                }
                onPress={() => router.push('./notifications')}
              />
            </Menu>
          </View>

          {/* 설정 */}
          <View className="mt-6">
            <Menu title="설정">
              <MenuItem
                move
                text="화면 테마"
                icon={<Entypo name="light-up" size={24} color={theme === 'light' ? '#6b7280' : '#d1d5db'} />}
                onPress={() => router.push('./theme')}
              />
            </Menu>
          </View>

          {/* 더보기 */}
          <View className="mt-6">
            <Menu title="더보기">
              <MenuItem
                move
                text="공지사항"
                icon={<FontAwesome6 name="newspaper" size={24} color={theme === 'light' ? '#6b7280' : '#d1d5db'} />}
              />
              <MenuItem
                move
                text="근무"
                icon={
                  <MaterialCommunityIcons
                    name="timer-outline"
                    size={24}
                    color={theme === 'light' ? '#6b7280' : '#d1d5db'}
                  />
                }
              />
              <MenuItem
                move
                text="구성원"
                icon={
                  <MaterialIcons name="people-outline" size={24} color={theme === 'light' ? '#6b7280' : '#d1d5db'} />
                }
              />
            </Menu>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
