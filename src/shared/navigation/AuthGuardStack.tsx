import { Stack } from 'expo-router';

import { usePalette } from '@/shared/components/ui/palette';

export function AuthGuardStack({ isLoggedIn }: { isLoggedIn: boolean }) {
  const palette = usePalette();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.base },
      }}
    >
      {/*
        가드에 막혔을 때 갈 곳을 명시한다. 생략하면 expo-router 가 첫 화면을 자동으로 고르는데,
        (tabs) 레이아웃이 _layout.ios.tsx 처럼 플랫폼 파일이면 '/(tabs)/_layout.ios' 로 이동해 404 가 된다.
      */}
      <Stack.Protected guard={isLoggedIn} redirectTo="/login">
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn} redirectTo="/">
        <Stack.Screen name="login" />
        <Stack.Screen name="callback" />
      </Stack.Protected>
    </Stack>
  );
}
