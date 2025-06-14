import { useContext } from 'react';

import { Image, ScrollView, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import Menu, { MenuItem } from '@/shared/components/menu/Menu';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

const DEFAULT_API_HOST = process.env.EXPO_PUBLIC_API_HOST;

export default function MoreIndex() {
  // context
  const { userDetail: user, onLogout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

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
            <Image
              className="size-24 rounded-2xl"
              source={{ uri: `${DEFAULT_API_HOST}/api/v1/users/${user?.uniqueId}/avatar` }}
              alt="user-avatar"
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
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* menu */}
      <View className="sise-full mt-4 px-4">
        <ScrollView className="size-full">
          {/* 계정 */}
          <View className="">
            <Menu title="계정">
              <MenuItem
                text="로그아웃"
                icon={<MaterialIcons name="logout" size={24} color={theme === 'light' ? '#6b7280' : '#d1d5db'} />}
                onPress={handleLogout}
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
                icon={
                  <MaterialIcons
                    name="notifications-none"
                    size={24}
                    color={theme === 'light' ? '#6b7280' : '#d1d5db'}
                  />
                }
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
