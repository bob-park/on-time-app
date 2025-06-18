import { useContext } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getUserCompLeaveEntries } from '@/domain/users/apis/usersCompLeaveEntries';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

export function useUserCompLeaveEntries({ userUniqueId }: { userUniqueId?: string }) {
  // context
  const { accessToken } = useContext(AuthContext);

  const { data, isLoading } = useQuery<UserCompLeaveEntry[]>({
    queryKey: ['users', userUniqueId, 'comp', 'leave', 'entries'],
    queryFn: () => getUserCompLeaveEntries(accessToken, { userUniqueId: userUniqueId || '' }),
    enabled: !!userUniqueId,
    staleTime: 10 * 1_000,
    gcTime: 20 * 1_000,
  });

  return { compLeaveEntries: data || [], isLoading };
}
