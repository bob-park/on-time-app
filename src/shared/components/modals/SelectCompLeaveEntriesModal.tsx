import { useContext, useState } from 'react';

import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import NoDataLottie from '@/assets/lotties/no-data.json';
import { useUserCompLeaveEntries } from '@/domain/users/queries/usersCompLeaveEntries';
import { Button } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import cx from 'classnames';
import LottieView from 'lottie-react-native';

const NoData = () => {
  return (
    <View className="mt-24 flex w-full flex-col items-center justify-center gap-3">
      <LottieView style={{ width: 150, height: 150 }} source={NoDataLottie} autoPlay loop />

      <View className="items-center justify-center">
        <Text className="text-muted dark:text-muted-dark text-lg font-extrabold">보상 휴가가 없어요..</Text>
      </View>
    </View>
  );
};

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
  const { userinfo: userDetail } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // state
  const [selectedEntries, setSelectedEntries] = useState<UserCompLeaveEntry[]>([]);

  // query
  const { compLeaveEntries } = useUserCompLeaveEntries({ userUniqueId: userDetail?.sub });

  // mode-safe raw colors
  const contentColor = theme === 'light' ? '#15171c' : '#ffffff';

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
      <View className="bg-base dark:bg-base-dark flex size-full flex-col items-center gap-3">
        {/* headers */}
        <View className="relative mt-6 w-full">
          <View className="mt-2 flex flex-col items-center justify-center gap-3">
            <Text className="text-content dark:text-content-dark text-xl font-bold">보상 휴가 선택</Text>
          </View>

          <TouchableOpacity
            className="bg-elevated dark:bg-elevated-dark absolute top-0 left-4 size-10 items-center justify-center rounded-full"
            onPress={() => onClose()}
          >
            <Ionicons name="close" size={24} color={contentColor} />
          </TouchableOpacity>
        </View>

        {/* contents */}
        <View className="w-full flex-1 px-5 py-4">
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
            ListFooterComponent={compLeaveEntries.length === 0 ? <NoData /> : <View className="h-40 w-full" />}
          />
        </View>

        {/* action */}
        <View className="w-full px-5 pb-8">
          <Button variant="primary" label="선택" onPress={handleSelect} />
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
        className={cx('flex w-full flex-row items-start gap-2 rounded-2xl border px-4 py-4', {
          'border-border bg-surface dark:border-border-dark dark:bg-surface-dark': !selected,
          'border-brand bg-surface dark:bg-surface-dark': selected,
        })}
        onPress={handleToggle}
      >
        <View className="mt-2 w-12 flex-none">
          <Feather name="calendar" size={24} color="#1ed760" />
        </View>
        <View className="flex-1">
          <View className="flex flex-col items-center gap-2">
            <Text
              className="text-content dark:text-content-dark w-full text-base font-semibold"
              numberOfLines={2}
              lineBreakMode="tail"
            >
              {entry.contents}
            </Text>

            <View className="flex w-full flex-row items-center gap-2">
              <Text className="text-muted dark:text-muted-dark w-20 flex-none text-sm">휴가 발생일 : </Text>
              <Text className="text-muted dark:text-muted-dark flex-1 text-sm">
                {dayjs(entry.effectiveDate).format('YYYY-MM-DD (dd)')}
              </Text>
            </View>

            <View className="flex w-full flex-row items-center gap-2">
              <Text className="text-muted dark:text-muted-dark w-20 flex-none text-sm">생성 휴가일 : </Text>
              <Text className="text-muted dark:text-muted-dark flex-1 text-sm">{entry.leaveDays}</Text>
            </View>
            <View className="flex w-full flex-row items-center gap-2">
              <Text className="text-muted dark:text-muted-dark w-20 flex-none text-sm">잔여일 : </Text>
              <Text className="text-muted dark:text-muted-dark flex-1 text-sm">{entry.leaveDays - entry.usedDays}</Text>
            </View>
          </View>
        </View>
        <View className="w-12 flex-none items-center justify-center">
          <MaterialCommunityIcons
            name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={selected ? '#1ed760' : theme === 'light' ? '#8a8f99' : 'rgba(255,255,255,0.5)'}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};
