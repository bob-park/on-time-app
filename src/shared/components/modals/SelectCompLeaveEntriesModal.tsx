import { useContext, useState } from 'react';

import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useUserCompLeaveEntries } from '@/domain/users/queries/usersCompLeaveEntries';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import cx from 'classnames';
import dayjs from 'dayjs';
import ko from 'dayjs/locale/ko';

dayjs.locale(ko);

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
        <View className="size-full px-5 py-4">
          <FlashList
            className="w-full"
            data={compLeaveEntries}
            renderItem={({ item, index }) => (
              <CompLeaveEntry
                entry={item}
                selected={selectedEntries.some((entry) => entry.id === item.id)}
                onToggle={handleSelectToggle}
              />
            )}
            ListFooterComponent={<View className="h-40 w-full" />}
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
  // context
  const { theme } = useContext(ThemeContext);

  // handle
  const handleToggle = () => {
    onToggle && onToggle(entry.id);
  };

  return (
    <View className="px-4 py-2">
      <TouchableOpacity
        className={cx('flex w-full flex-row items-start gap-2 rounded-2xl px-4 py-4', {
          'bg-gray-50 dark:bg-gray-900': !selected,
          'bg-gray-200 dark:bg-gray-700': selected,
        })}
        style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 2, height: 4 } }}
        onPress={handleToggle}
      >
        <View className="mt-2 w-12 flex-none">
          <Feather name="calendar" size={24} color={theme === 'light' ? 'black' : 'white'} />
        </View>
        <View className="flex-1">
          <View className="flex flex-col items-center gap-2">
            <Text className="w-full text-base font-semibold dark:text-white" numberOfLines={2} lineBreakMode="tail">
              {entry.contents}
            </Text>

            <View className="flex w-full flex-row items-center gap-2">
              <Text className="w-20 flex-none text-sm text-gray-500 dark:text-gray-400">휴가 발생일 : </Text>
              <Text className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                {dayjs(entry.effectiveDate).format('YYYY-MM-DD (dd)')}
              </Text>
            </View>

            <View className="flex w-full flex-row items-center gap-2">
              <Text className="w-20 flex-none text-sm text-gray-500 dark:text-gray-400">생성 휴가일 : </Text>
              <Text className="flex-1 text-sm text-gray-500 dark:text-gray-400">{entry.leaveDays}</Text>
            </View>
            <View className="flex w-full flex-row items-center gap-2">
              <Text className="w-20 flex-none text-sm text-gray-500 dark:text-gray-400">잔여일 : </Text>
              <Text className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                {entry.leaveDays - entry.usedDays}
              </Text>
            </View>
          </View>
        </View>
        <View className="w-12 flex-none">
          {theme === 'light' &&
            (selected ? (
              <MaterialCommunityIcons name="checkbox-marked" size={24} color="black" />
            ) : (
              <MaterialCommunityIcons name="checkbox-blank-outline" size={24} color="black" />
            ))}
          {theme === 'dark' &&
            (selected ? (
              <MaterialCommunityIcons name="checkbox-outline" size={24} color="white" />
            ) : (
              <MaterialCommunityIcons name="checkbox-blank-outline" size={24} color="white" />
            ))}
        </View>
      </TouchableOpacity>
    </View>
  );
};
