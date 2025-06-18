import { useContext, useState } from 'react';

import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useUserCompLeaveEntries } from '@/domain/users/queries/usersCompLeaveEntries';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import cx from 'classnames';
import dayjs from 'dayjs';

interface SelectCompLeaveEntriesModalProps {
  show: boolean;
  onClose: () => void;
  onSelect: (entries: UserCompLeaveEntry[]) => void;
}

export default function SelectCompLeaveEntriesModal({
  show,
  onClose,
  onSelect,
}: Readonly<SelectCompLeaveEntriesModalProps>) {
  // context
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // state
  const [selectedEntries, setSelectedEntries] = useState<UserCompLeaveEntry[]>([]);

  // query
  const { compLeaveEntries } = useUserCompLeaveEntries({ userUniqueId: user?.uniqueId });

  // handle
  const handleSelect = () => {
    onSelect(selectedEntries || []);

    onClose();
  };

  const handleSelectToggle = (id: number) => {
    setSelectedEntries((prev) => {
      const newSelectedEntries = prev.slice();

      const compEntry = compLeaveEntries.find((item) => item.id === id);
      const index = prev.findIndex((entry) => entry.id === id);

      if (index > -1) {
        newSelectedEntries.splice(index, 1);
      } else {
        compEntry && newSelectedEntries.push(compEntry);
      }

      return newSelectedEntries;
    });
  };

  return (
    <Modal visible={show} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex size-full flex-col items-center gap-3 dark:bg-black">
        {/* headers */}
        <View className="relative mt-6 w-full">
          <View className="mt-2 flex flex-col items-center justify-center gap-3">
            <Text className="text-xl font-bold">보상 휴가 선택</Text>
          </View>

          <TouchableOpacity
            className="absolute left-4 top-0 size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            onPress={() => onClose()}
          >
            <Ionicons name="close" size={24} color={theme === 'light' ? 'black' : 'white'} />
          </TouchableOpacity>

          <TouchableOpacity
            className="absolute right-4 top-0 h-10 w-20 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
            onPress={handleSelect}
          >
            <Text className="font-bold dark:text-gray-100">선택</Text>
          </TouchableOpacity>
        </View>

        {/* contents */}
        <View className="size-full p-4">
          <FlashList
            className="w-full"
            data={compLeaveEntries}
            ListHeaderComponent={
              <View className="mb-1 mt-1 flex w-full flex-row items-center gap-2 rounded-t-xl bg-gray-100 p-3 dark:bg-gray-800">
                <Text className="w-44 flex-none text-center text-sm font-bold dark:text-gray-100" ellipsizeMode="tail">
                  내용
                </Text>
                <Text className="w-24 flex-none text-center text-sm font-bold dark:text-gray-100">발생일</Text>
                <Text className="w-12 flex-none text-center text-sm font-bold dark:text-gray-100">휴가일</Text>
                <Text className="w-12 flex-none text-center text-sm font-bold dark:text-gray-100">잔여일</Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <CompLeaveEntry
                entry={item}
                selected={selectedEntries.some((entry) => entry.id === item.id)}
                onToggle={handleSelectToggle}
              />
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const CompLeaveEntry = ({
  entry,
  selected = false,
  onToggle,
}: Readonly<{
  entry: UserCompLeaveEntry;
  selected?: boolean;
  onToggle?: (id: number) => void;
}>) => {
  // handle
  const handleToggle = () => {
    onToggle && onToggle(entry.id);
  };

  return (
    <TouchableOpacity className="my-2" onPress={handleToggle}>
      <View
        className={cx('flex h-20 w-full flex-row items-center gap-2 rounded-2xl px-3 py-2', {
          'border-2 border-gray-200 bg-gray-200 bg-gray-700 dark:border-gray-700': selected,
        })}
      >
        <Text className="w-44 flex-none text-sm dark:text-white" ellipsizeMode="tail" numberOfLines={2}>
          {entry.contents}
        </Text>
        <Text className="w-24 flex-none text-sm dark:text-white">{dayjs(entry.effectedDate).format('YYYY-MM-DD')}</Text>
        <Text className="w-12 flex-none text-right text-sm font-semibold dark:text-white">{entry.leaveDays}</Text>
        <Text className="w-12 flex-none text-right text-sm font-semibold dark:text-white">{entry.usedDays}</Text>
      </View>
    </TouchableOpacity>
  );
};
