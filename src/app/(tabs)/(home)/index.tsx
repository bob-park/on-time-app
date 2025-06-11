import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FontAwesome5, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';

import { getDaysOfWeek } from '@/utils/parse';

import { FlashList } from '@shopify/flash-list';
import cx from 'classnames';
import dayjs from 'dayjs';

const WEEKEND_DAYS = [0, 6];

export default function HomeIndex() {
  return (
    <View className="flex size-full flex-col items-center gap-8 p-4">
      {/* headers */}
      <View className="w-full px-2">
        <View className="flex flex-row items-center justify-between gap-3">
          {/* today */}
          <View className="flex flex-row items-end gap-1">
            <Text className="text-3xl font-bold">{dayjs().format('MM월 DD일')}</Text>
            <Text
              className={cx('text-xl font-bold', {
                'text-black': !WEEKEND_DAYS.includes(dayjs().day()),
                'text-blue-500': dayjs().day() === 6,
                'text-red-600': dayjs().day() === 0,
              })}
            >
              ({getDaysOfWeek(dayjs().day())})
            </Text>
          </View>

          {/* notification */}
          <TouchableOpacity className="relative items-center justify-between">
            <MaterialIcons name="notifications-none" size={30} color="black" />

            <View className="absolute right-0 top-0 flex size-4 flex-col items-center justify-center rounded-full bg-white">
              <View className="size-2 rounded-full bg-red-500"></View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* search */}
      <View className="w-full">
        <View className="flex w-full flex-row items-center gap-4 rounded-xl border-[1px] border-gray-50 bg-gray-50 px-3 py-2">
          <Ionicons name="search" size={24} color="gray" />
          <TextInput
            className="my-2 text-lg"
            numberOfLines={1}
            placeholder="찾는게 있으신가요?"
            placeholderTextColor="gray"
          />
        </View>
      </View>

      {/* action button */}
      <View className="w-full">
        <ScrollView className="h-16" horizontal>
          <TouchableOpacity className="mr-5 flex h-14 flex-row items-center justify-center gap-3 rounded-xl bg-gray-50 px-5 py-3">
            <MaterialIcons name="timer" size={24} color="#34d399" />
            <Text className="text-lg font-bold">근무 입력</Text>
          </TouchableOpacity>

          <TouchableOpacity className="mr-5 flex h-14 flex-row items-center justify-center gap-3 rounded-xl bg-gray-50 px-5 py-3">
            <Fontisto name="parasol" size={20} color="#f0abfc" />
            <Text className="text-lg font-bold">휴가 등록</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex h-14 flex-row items-center justify-center gap-3 rounded-xl bg-gray-50 px-5 py-3">
            <MaterialIcons name="work" size={24} color="#6b7280" />
            <Text className="text-lg font-bold">근무 확인</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 내 근무 */}
      <View className="size-full">
        <FlashList
          className="w-full"
          data={new Array(1).fill('*')}
          onRefresh={() => {}}
          renderItem={() => (
            <View className="flex flex-col items-center gap-3">
              <View className="w-full">
                <Text className="text-lg font-bold text-gray-400">내 근무</Text>
              </View>

              <View className="w-full rounded-xl bg-gray-50 px-6 py-4">
                <View className="flex flex-col items-center gap-6">
                  {/* 출근 시간 */}
                  <View className="w-full border-b-[1px] border-b-white">
                    <View className="flex h-12 flex-row items-center justify-between gap-4">
                      <View className="">
                        <Text className="text-base font-semibold text-gray-500">출근 시간</Text>
                      </View>
                      <View className="flex flex-row items-end gap-2">
                        {dayjs().hour() > 11 && <Text className="text-lg font-semibold">오후</Text>}
                        <Text className="text-lg font-semibold">{dayjs().format('hh시 MM분')}</Text>
                      </View>
                    </View>
                  </View>

                  {/* 목표 퇴근 시간 */}
                  <View className="w-full border-b-[1px] border-b-white">
                    <View className="flex h-12 flex-row items-center justify-between gap-4">
                      <View className="flex flex-row gap-3">
                        <Ionicons name="rocket" size={20} color="#10b981" />
                        <Text className="text-base font-semibold text-gray-500">목표 퇴근 시간</Text>
                      </View>
                      <View className="flex flex-row items-end gap-2">
                        {dayjs().hour() > 11 && <Text className="text-lg font-semibold">오후</Text>}
                        <Text className="text-lg font-semibold">{dayjs().format('hh시 MM분')}</Text>
                      </View>
                    </View>
                  </View>

                  {/* 퇴근 시간 */}
                  <View className="w-full">
                    <View className="flex h-12 flex-row items-center justify-between gap-4">
                      <View className="flex flex-row gap-3">
                        <FontAwesome5 name="running" size={24} color="black" />
                        <Text className="text-base font-semibold text-gray-500">퇴근 시간</Text>
                      </View>
                      <View className="flex flex-row items-end gap-2">
                        {dayjs().hour() > 11 && <Text className="text-lg font-semibold">오후</Text>}
                        <Text className="text-lg font-semibold">{dayjs().format('hh시 MM분')}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}
