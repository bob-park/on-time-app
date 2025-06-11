import { createContext, useEffect, useMemo, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { getUserDetail } from '@/domain/users/apis/users';

import dayjs from 'dayjs';

const KEY_ACCESS_TOKEN = 'accessToken';
const KEY_REFRESH_TOKEN = 'refreshToken';
const KEY_EXPIRED_AT = 'expiredAt';

WebBrowser.maybeCompleteAuthSession();

interface AuthContext {
  user?: User;
  userDetail?: UserDetail;
  isLoggedIn: boolean;
  onLoggedIn: (user: User) => void;
  onLogout: () => void;
}

export const AuthContext = createContext<AuthContext>({ isLoggedIn: false, onLoggedIn: () => {}, onLogout: () => {} });

export default function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [user, setUser] = useState<User>();
  const [userDetail, setUserDetail] = useState<UserDetail>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // useEffect
  useEffect(() => {
    AsyncStorage.getItem('user').then((data) => {
      if (!data) {
        return;
      }

      setUser(JSON.parse(data) as User);
    });

    // TODO: access Token 체크
    SecureStore.getItemAsync(KEY_EXPIRED_AT).then((data) => {
      if (!data) {
        setIsLoggedIn(false);
        return;
      }

      const expiredAt = parseInt(data, 0);

      setIsLoggedIn(dayjs.unix(expiredAt).isAfter(dayjs()));
    });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    getUserDetail(user.uniqueId)
      .then((data: UserDetail) => setUserDetail(data))
      .catch((err) => console.error(err));
  }, [user]);

  // handle
  const handleLogin = (user: User) => {
    setIsLoggedIn(true);
    setUser(user);

    AsyncStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(undefined);

    AsyncStorage.removeItem('user');
    SecureStore.deleteItemAsync(KEY_ACCESS_TOKEN);
    SecureStore.deleteItemAsync(KEY_REFRESH_TOKEN);
    SecureStore.deleteItemAsync(KEY_EXPIRED_AT);

    setIsLoggedIn(false);
  };

  // memorize
  const memorizeValue = useMemo<AuthContext>(
    () => ({ isLoggedIn, user, userDetail, onLoggedIn: handleLogin, onLogout: handleLogout }),
    [user, userDetail, isLoggedIn],
  );

  return <AuthContext value={memorizeValue}>{children}</AuthContext>;
}
