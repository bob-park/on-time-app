import { useContext } from 'react';

import { View } from 'react-native';

import { Tabs } from 'expo-router';

import { Entypo } from '@expo/vector-icons';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

export default function TabLayout() {
  // context
  const { theme } = useContext(ThemeContext);

  return (
    <View className="size-full">
      {/* header */}
      <View className="mt-14 flex flex-col items-center justify-center gap-3"></View>

      {/* tabs */}
      <Tabs
        backBehavior="history" // default 가 initial route 이기 때문에 뒤로가기 하면 home 으로 감
        screenOptions={{
          headerShown: false,
          tabBarLabel: () => null,
          tabBarStyle: { backgroundColor: 'none' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <Entypo name="home" size={24} color={focused ? (theme === 'light' ? 'black' : 'white') : 'gray'} />
            ),
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: 'tab two',
            tabBarIcon: ({ focused }) => (
              <Entypo name="home" size={24} color={focused ? (theme === 'light' ? 'black' : 'white') : 'gray'} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
