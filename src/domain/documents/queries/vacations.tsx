import { useContext } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import { createVacation, getVacations } from '@/domain/documents/apis/vacations';
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

export function useCreateVacation({ onSuccess, onError }: QueryHandler<DocumentVacation>) {
  // context
  const { accessToken } = useContext(AuthContext);

  const { mutate, isPending } = useMutation({
    mutationKey: ['create', 'documents', 'vacation'],
    mutationFn: (req: CreateDocumentVacationRequest) => createVacation(accessToken, req),
    onSuccess: (data) => {
      onSuccess && onSuccess(data);
    },
    onError: () => {
      onError && onError();
    },
  });

  return { createVacation: mutate, isLoading: isPending };
}
