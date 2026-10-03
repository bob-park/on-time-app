/// <reference types="jest" />
import { useSyncExternalStore } from 'react';

import { Text } from 'react-native';

import { Stack, router } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import { AuthGuardStack } from '@/shared/navigation/AuthGuardStack';

// 로그인 상태를 테스트 중간에 바꾸기 위한 최소 store
let loggedIn = false;
const listeners = new Set<() => void>();
const auth = {
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => loggedIn,
  set: (value: boolean) => {
    loggedIn = value;
    listeners.forEach((listener) => listener());
  },
};

function RootLayout() {
  return <AuthGuardStack isLoggedIn={useSyncExternalStore(auth.subscribe, auth.get)} />;
}

// 실제 앱처럼 (tabs) 레이아웃이 iOS 전용 파일(_layout.ios)과 기본 파일로 나뉜 구조
const files = {
  _layout: RootLayout,
  '(tabs)/_layout': () => <Stack />,
  '(tabs)/_layout.ios': () => <Stack />,
  '(tabs)/(home)/_layout': () => <Stack />,
  '(tabs)/(home)/index': () => <Text>HOME</Text>,
  login: () => <Text>LOGIN</Text>,
  callback: () => <Text>CALLBACK</Text>,
  '+not-found': () => <Text>NOT_FOUND</Text>,
};

describe('AuthGuardStack', () => {
  beforeEach(() => auth.set(false));

  it('OAuth 콜백(/callback) 에서 로그인되면 404 가 아니라 홈으로 이동한다', async () => {
    await renderRouter(files, { initialUrl: '/login' });
    await act(async () => {
      router.push('/callback?code=x&state=y');
    });

    await act(async () => {
      auth.set(true);
    });

    expect(screen.queryByText('NOT_FOUND')).toBeNull();
    expect(screen.getByText('HOME')).toBeTruthy();
  });

  it('로그아웃되면 로그인 화면으로 이동한다', async () => {
    auth.set(true);
    await renderRouter(files, { initialUrl: '/' });

    await act(async () => {
      auth.set(false);
    });

    expect(screen.queryByText('NOT_FOUND')).toBeNull();
    expect(screen.getByText('LOGIN')).toBeTruthy();
  });
});
