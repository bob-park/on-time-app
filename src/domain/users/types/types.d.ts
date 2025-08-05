interface UserRoleDetail {
  id: string;
  type: UserRole;
  description?: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  isLeader: boolean;
  teamUserDescription?: string;
}

interface Position {
  id: string;
  name: string;
}

interface UserDetail {
  id: string;
  userId: string;
  username: string;
  role: UserRoleDetail;
  email?: string;
  group?: Team;
  position?: Position;
}

interface UserLeaveEntry {
  id: number;
  userUniqueId: string;
  year: number;
  totalLeaveDays: number;
  usedLeaveDays: number;
  totalCompLeaveDays: number;
  usedCompLeaveDays: number;
  createdDate: Date;
  lastModifiedDate?: Date;
}

interface UserCompLeaveEntry {
  id: number;
  contents: string;
  effectiveDate: Date;
  leaveDays: number;
  usedDays: number;
  totalCompLeaveDays: number;
  usedCompLeaveDays: number;
  createdDate: Date;
  lastModifiedDate?: Date;
}

interface UserEmployment {
  id: number;
  userUniqueId: string;
  effectiveDate: Date;
  status: 'ACTIVE' | 'INACTIVE';
  createdDate: Date;
  createdBy: string;
}
