interface UserRoleDetail {
  id: number;
  type: UserRole;
  description?: string;
}

interface Team {
  id: number;
  name: string;
  description?: string;
  isLeader: boolean;
  teamUserDescription?: string;
}

interface Position {
  id: number;
  name: string;
}

interface UserDetail {
  uniqueId: string;
  userId: string;
  username: string;
  role: UserRoleDetail;
  email?: string;
  team?: Team;
  position?: Position;
}
