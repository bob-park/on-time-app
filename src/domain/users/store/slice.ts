import { BoundState } from '@/shared/store/rootStore';

import { SlicePattern } from 'zustand';

import { UserState } from './users.state';

const createUserSlice: SlicePattern<UserState, BoundState> = (set) => ({
  isLoggedIn: false,
  loggedIn: (userinfo) =>
    set(
      () => {
        return {
          userinfo,
          isLoggedIn: true,
        };
      },
      false,
      { type: 'user/loggedIn' },
    ),
  loggedOut: () =>
    set(
      () => {
        return {
          userinfo: undefined,
          isLoggedIn: false,
        };
      },
      false,
      {
        type: 'user/loggedOut',
      },
    ),
});

export default createUserSlice;
