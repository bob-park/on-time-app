import { useContext } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { showToast } from '@/utils/toast';

import dayjs from 'dayjs';

export default function Schedule() {
  // context
  const { onSendNotification, token } = useContext(NotificationContext);

  // handle
  const handlePress = () => {
    onSendNotification({ title: 'title', description: 'description' });
  };

  const handleToast = () => {
    showToast({
      title: '출근 처리',
      description: `${dayjs().format('HH:mm:ss')} 으로 출근 처리하였습니다.`,
    });
  };

  return (
    <View className="flex size-full flex-col items-center justify-center gap-10 bg-white dark:bg-black">
      <Text className="">준비중</Text>

      <TouchableOpacity
        className="m-5 h-12 w-full items-center justify-center rounded-xl bg-gray-300"
        onPress={handlePress}
      >
        <Text className="">push noti</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="m-5 h-12 w-full items-center justify-center rounded-xl bg-gray-300"
        onPress={handleToast}
      >
        <Text className="">toast</Text>
      </TouchableOpacity>
    </View>
  );
}
