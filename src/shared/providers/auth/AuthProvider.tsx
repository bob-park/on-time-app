import { createContext, useEffect, useMemo, useState } from 'react';

import { TokenResponse, fetchUserInfoAsync, makeRedirectUri, refreshAsync } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { useQueryClient } from '@tanstack/react-query';

import { deleteUserNotificationProvider } from '@/domain/notification/apis/userNotification';
import { getUserDetail } from '@/domain/users/apis/users';
import dayjs from '@/shared/dayjs';
import delay from '@/utils/delay';

const KEY_ACCESS_TOKEN = 'accessToken';
const KEY_REFRESH_TOKEN = 'refreshToken';
const KEY_EXPIRED_AT = 'expiredAt';
const KEY_USER_PROVIDER_ID = 'userProviderId';

WebBrowser.maybeCompleteAuthSession();

export const clientId = process.env.EXPO_PUBLIC_AUTHORIZATION_CLIENT_ID || '';
export const clientSecret = process.env.EXPO_PUBLIC_AUTHORIZATION_CLIENT_SECRET || '';

export const discovery = {
  authorizationEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/oauth2/authorize`,
  tokenEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/oauth2/token`,
  revocationEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/oauth2/revoke`,
  userInfoEndpoint: `${process.env.EXPO_PUBLIC_AUTHORIZATION_SERVER}/userinfo`,
};

export const redirectUri = makeRedirectUri({
  scheme: 'ontime',
  path: 'callback',
});

interface AuthContext {
  userDetail?: UserDetail;
  accessToken: string;
  refreshToken?: string;
  isLoggedIn: boolean;
  onLoggedIn: (token: TokenResponse) => void;
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

  // queries
  const queryClient = useQueryClient();

  // useEffect
  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    getUserDetail(user.uniqueId)
      .then((data: UserDetail) => {
        setUserDetail(data);
        console.log('logged in');
        setIsLoggedIn(true);
      })
      .catch((err) => {
        console.error(err);
        handleLogout();
      });
  }, [user]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    // fetch user info
    fetchUserInfoAsync(
      {
        accessToken,
      },
      discovery,
    )
      .then((data) => {
        if (!data) {
          throw new Error('unauthorized');
        }

        return data.profile as User;
      })
      .then(async (user) => {
        setUser(user);
        loadAuth();
      })
      .catch((err) => {
        console.error(err);
        refreshToken ? handleRefreshAccessToken(refreshToken) : handleLogout();
      });
  }, [accessToken, refreshToken]);

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

  const handleLogout = () => {
    Promise.all([
      SecureStore.getItemAsync(KEY_USER_PROVIDER_ID).then(async (data) => {
        if (data && user) {
          await deleteUserNotificationProvider({ userUniqueId: user.uniqueId, userProviderId: data });
        }

        SecureStore.deleteItemAsync(KEY_USER_PROVIDER_ID);
      }),
      SecureStore.deleteItemAsync(KEY_ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEY_REFRESH_TOKEN),
      SecureStore.deleteItemAsync(KEY_EXPIRED_AT),
    ]).then(() => {
      setUser(undefined);
      setIsLoggedIn(false);
      setAccessToken('');
      setRefreshToken(undefined);
      setExpiredAt(undefined);
    });
  };

  const handleRefreshAccessToken = (refreshToken: string) => {
    console.log('refresh token...');

    refreshAsync({ refreshToken, clientId, clientSecret }, discovery)
      .then(async (data) => {
        await handleLoggedIn(data);

        loadAuth();
      })
      .catch((err) => {
        console.error(err);

        handleLogout();
      });
  };

  const loadAuth = () => {
    console.log('loaded auth...');

    Promise.all([
      SecureStore.getItemAsync(KEY_EXPIRED_AT).then((data) => {
        if (!data) {
          return;
        }

        return dayjs(data).toDate();
      }),
      SecureStore.getItemAsync(KEY_ACCESS_TOKEN).then((data) => {
        if (!data) {
          return;
        }

        return data;
      }),
      SecureStore.getItemAsync(KEY_REFRESH_TOKEN).then((data) => {
        if (!data) {
          return;
        }

        return data;
      }),
    ]).then(([expiredAt, accessToken, refreshToken]) => {
      setExpiredAt(expiredAt);
      setAccessToken(accessToken || '');
      setRefreshToken(refreshToken);
    });
  };

  const handleLoggedIn = (token: TokenResponse) => {
    const unixtimestamp = (token.expiresIn || 0) + token.issuedAt;

    Promise.all([
      SecureStore.setItemAsync(KEY_ACCESS_TOKEN, token.accessToken),
      SecureStore.setItemAsync(KEY_REFRESH_TOKEN, token.refreshToken || ''),
      SecureStore.setItemAsync(KEY_EXPIRED_AT, dayjs.unix(unixtimestamp).toISOString()),
    ]).then(async () => {
      setAccessToken(token.accessToken);
      setRefreshToken(token.refreshToken);
      setExpiredAt(dayjs.unix(unixtimestamp).toDate());

      queryClient.clear();

      await delay(1_000);
    });
  };

  // memorize
  const memorizeValue = useMemo<AuthContext>(
    () => ({
      isLoggedIn,
      userDetail,
      accessToken,
      refreshToken,
      onLoggedIn: handleLoggedIn,
      onLogout: handleLogout,
    }),
    [userDetail, accessToken, refreshToken, isLoggedIn],
  );

  return <AuthContext value={memorizeValue}>{children}</AuthContext>;
}
