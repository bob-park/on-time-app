import { useQuery } from '@tanstack/react-query';

import { getUserDetail } from '@/domain/users/apis/users';

export function useUser(uniqueId?: string) {
  const { data, isLoading } = useQuery<UserDetail>({
    queryKey: ['users', uniqueId],
    queryFn: () => getUserDetail(uniqueId || ''),
    enabled: !!uniqueId,
  });

  return { user: data, isLoading };
}
