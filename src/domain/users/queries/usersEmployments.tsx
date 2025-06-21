import { useContext } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getUserEmployment } from '@/domain/users/apis/usersEmployments';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

export function useUserEmployment(userUniqueId?: string) {
  // context
  const { accessToken } = useContext(AuthContext);

  const { data, isLoading } = useQuery<UserEmployment>({
    queryKey: ['users', userUniqueId, 'employment'],
    queryFn: () => getUserEmployment(accessToken, { userUniqueId: userUniqueId || '' }),
    enabled: !!userUniqueId,
  });

  return { employment: data, isLoading };
}
