import { useContext } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';

export default function Schedule() {
  // context
  const { onSendNotification, token } = useContext(NotificationContext);

  // handle
  const handlePress = () => {
    onSendNotification({ title: 'title', description: 'description' });
  };

  return (
    <View className="flex size-full flex-col items-center justify-center gap-10">
      <Text className="">준비중</Text>

      <TouchableOpacity
        className="m-5 h-12 w-full items-center justify-center rounded-xl bg-gray-300"
        onPress={handlePress}
      >
        <Text className="">push noti</Text>
      </TouchableOpacity>
    </View>
  );
}
