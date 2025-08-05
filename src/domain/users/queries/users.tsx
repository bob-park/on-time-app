import { useContext } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getUserDetail, getUserLeaveEntry } from '@/domain/users/apis/users';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

export function useUser(uniqueId?: string) {
  const { data, isLoading } = useQuery<UserDetail>({
    queryKey: ['users', uniqueId],
    queryFn: () => getUserDetail(uniqueId || ''),
    enabled: !!uniqueId,
  });

  return { user: data, isLoading };
}

export function useUserLeaveEntry({ uniqueId, year }: { uniqueId?: string; year: number }) {
  // context
  const { accessToken } = useContext(AuthContext);

  const { data, isLoading } = useQuery<UserLeaveEntry>({
    queryKey: ['users', uniqueId, 'leave', 'entries', year],
    queryFn: () => getUserLeaveEntry(accessToken, { id: uniqueId || '', year }),
    enabled: !!uniqueId,
  });

  return { leaveEntry: data, isLoading };
}
