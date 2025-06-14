import { useContext } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getVacations } from '@/domain/documents/apis/vacations';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

export function useVacations(
  params: {
    userUniqueId?: string;
    status?: ApprovalStatus;
    startDateFrom: Date;
    endDateFrom: Date;
  } & PageRequest,
) {
  // context
  const { accessToken } = useContext(AuthContext);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', 'vacations', params],
    queryFn: () => getVacations(accessToken, params).then((data) => data.content),
  });

  return { vacations: data || [], isLoading };
}
