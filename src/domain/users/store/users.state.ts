type UserState = {
  userinfo?: UserInfo;
  isLoggedIn: boolean;
  loggedIn: (userinfo: UserInfo) => void;
  loggedOut: () => void;
};

export type { UserState };
