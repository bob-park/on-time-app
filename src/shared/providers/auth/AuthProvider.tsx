import { createContext, useEffect, useMemo, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { TokenResponse, makeRedirectUri, refreshAsync } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { getUserDetail } from '@/domain/users/apis/users';
import delay from '@/utils/delay';

import dayjs from 'dayjs';

const KEY_USER = 'user';
const KEY_ACCESS_TOKEN = 'accessToken';
const KEY_REFRESH_TOKEN = 'refreshToken';
const KEY_EXPIRED_AT = 'expiredAt';

WebBrowser.maybeCompleteAuthSession();

export const clientId = process.env.EXPO_PUBLIC_AUTHORIZATION_CLIENT_ID || '';
export const clientSecret = process.env.EXPO_PUBLIC_AUTHORIZATION_CLIENT_SECRET || '';

export const discovery = {
  authorizationEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/oauth2/authorize`,
  tokenEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/oauth2/token`,
  revocationEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/oauth2/revoke`,
};

export const redirectUri = makeRedirectUri({
  scheme: 'ontime',
  path: 'callback',
});

interface AuthContext {
  user?: User;
  userDetail?: UserDetail;
  accessToken: string;
  refreshToken?: string;
  isLoggedIn: boolean;
  onLoggedIn: (user: User) => void;
  onLogout: () => void;
}

export const AuthContext = createContext<AuthContext>({
  accessToken: '',
  isLoggedIn: false,
  onLoggedIn: () => {},
  onLogout: () => {},
});

export default function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [user, setUser] = useState<User>();
  const [expiredAt, setExpiredAt] = useState<Date>();
  const [userDetail, setUserDetail] = useState<UserDetail>();
  const [accessToken, setAccessToken] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState<string>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  console.log(redirectUri);

  // useEffect
  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    getUserDetail(user.uniqueId)
      .then((data: UserDetail) => setUserDetail(data))
      .catch((err) => console.error(err));
  }, [user]);

  useEffect(() => {
    if (!expiredAt) {
      return;
    }

    const intervalId = setInterval(() => {
      if (dayjs(expiredAt).subtract(10, 'minute').isBefore(dayjs())) {
        refreshToken && handleRefreshAccessToken(refreshToken);
      }
    }, 1_000);

    return () => {
      intervalId && clearInterval(intervalId);
    };
  }, [expiredAt, refreshToken]);

  // handle
  const handleLogin = (user: User) => {
    loadAuth();
    setUser(user);
    AsyncStorage.setItem(KEY_USER, JSON.stringify(user));
  };

  const handleLogout = () => {
    AsyncStorage.removeItem(KEY_USER);
    SecureStore.deleteItemAsync(KEY_ACCESS_TOKEN);
    SecureStore.deleteItemAsync(KEY_REFRESH_TOKEN);
    SecureStore.deleteItemAsync(KEY_EXPIRED_AT);

    setUser(undefined);
    setIsLoggedIn(false);
    setAccessToken('');
    setRefreshToken(undefined);
    setExpiredAt(undefined);
  };

  const handleRefreshAccessToken = (refreshToken: string) => {
    console.log('refresh token...');

    refreshAsync({ refreshToken, clientId, clientSecret }, discovery)
      .then(async (data) => {
        await saveAuth(data);

        loadAuth();
      })
      .catch((err) => {
        console.error(err);

        setIsLoggedIn(false);
      });
  };

  const loadAuth = () => {
    AsyncStorage.getItem(KEY_USER).then((data) => {
      if (!data) {
        return;
      }

      setUser(JSON.parse(data) as User);
    });

    SecureStore.getItemAsync(KEY_EXPIRED_AT).then((data) => {
      if (!data) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(dayjs(data).isAfter(dayjs()));
      setExpiredAt(dayjs(data).toDate());
    });

    // TODO: access Token 체크
    SecureStore.getItemAsync(KEY_ACCESS_TOKEN).then((data) => {
      if (!data) {
        return;
      }

      setAccessToken(data);
    });

    SecureStore.getItemAsync(KEY_REFRESH_TOKEN).then((data) => {
      if (!data) {
        return;
      }

      setRefreshToken(data);
    });
  };

  const saveAuth = (token: TokenResponse) => {
    const unixtimestamp = (token.expiresIn || 0) + token.issuedAt;

    Promise.all([
      SecureStore.setItemAsync(KEY_ACCESS_TOKEN, token.accessToken),
      SecureStore.setItemAsync(KEY_REFRESH_TOKEN, token.refreshToken || ''),
      SecureStore.setItemAsync(KEY_EXPIRED_AT, dayjs.unix(unixtimestamp).toISOString()),
    ]).then(async () => {
      await delay(1_000);
    });
  };

  // memorize
  const memorizeValue = useMemo<AuthContext>(
    () => ({
      isLoggedIn,
      user,
      userDetail,
      accessToken,
      refreshToken,
      onLoggedIn: handleLogin,
      onLogout: handleLogout,
    }),
    [user, userDetail, accessToken, refreshToken, isLoggedIn],
  );

  return <AuthContext value={memorizeValue}>{children}</AuthContext>;
}
