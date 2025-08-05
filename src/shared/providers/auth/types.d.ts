type UserRole = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_USER';

interface User {
  id: string;
  userId: string;
  username: string;
  role: UserRole;
}

interface UserInfo {
  sub: string;
  profile: User;
}
