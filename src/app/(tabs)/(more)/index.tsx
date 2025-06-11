import { useContext } from 'react';

import { Image, Text, View } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import Menu, { MenuItem } from '@/shared/components/menu/Menu';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

const DEFAULT_USER_SERVICE_HOST = process.env.EXPO_PUBLIC_USER_SERVICE_HOST;

export default function MoreIndex() {
  // context
  const { userDetail: user, onLogout } = useContext(AuthContext);

  // handle
  const handleLogout = () => {
    onLogout();
  };

  return (
    <View className="flex size-full flex-col gap-3">
      {/* user */}
      <View className="mt-5 w-full border-b-[1px] border-gray-200 pb-3">
        <View className="flex w-full flex-row items-center gap-2">
          {/* avatar */}
          <View className="w-28 flex-none p-3">
            <Image
              className="size-24 rounded-2xl"
              source={{ uri: `${DEFAULT_USER_SERVICE_HOST}/api/v1/users/${user?.uniqueId}/avatar` }}
              alt="user-avatar"
            />
          </View>

          {/* name */}
          <View className="">
            <View className="flex flex-col items-center gap-2">
              {/* name */}
              <View className="w-full">
                <Text className="text-2xl font-bold dark:text-white">{user?.username}</Text>
                <Text className="mt-1 font-semibold text-gray-500">{user?.position?.name}</Text>
              </View>

              <View className="flex flex-row items-center gap-3">
                {/* team - position */}
                <View className="flex flex-row items-center gap-1">
                  <Text className="font-semibold text-gray-500">{user?.team?.name}</Text>
                  {user?.team?.teamUserDescription && (
                    <Text className="font-semibold text-gray-500">({user?.team?.teamUserDescription})</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* menu */}
      <View className="mt-4">
        {/* 계정 */}
        <Menu title="계정">
          <MenuItem
            text="로그아웃"
            icon={<MaterialIcons name="logout" size={24} color="#6b7280" onPress={handleLogout} />}
          />
        </Menu>
      </View>
    </View>
  );
}
