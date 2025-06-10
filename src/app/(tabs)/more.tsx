import { useContext } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { AuthContext } from '@/shared/providers/auth/AuthProvider';

export default function Schedule() {
  // context
  const { onLogout } = useContext(AuthContext);

  // handle
  const handleLogout = () => {
    onLogout();
  };

  return (
    <View className="flex size-full flex-col items-center justify-center gap-3">
      <Text>more</Text>

      <TouchableOpacity className="h-14 w-32 items-center justify-center rounded-2xl bg-black" onPress={handleLogout}>
        <Text className="text-2xl font-bold text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
