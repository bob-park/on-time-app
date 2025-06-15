import { useContext } from 'react';

import { useMutation } from '@tanstack/react-query';

import { requestDocument } from '@/domain/documents/apis/documents';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

export function useRequestDocument() {
  // context
  const { accessToken } = useContext(AuthContext);

  const { mutate, isPending } = useMutation({
    mutationKey: ['request', 'documents'],
    mutationFn: (id: number) => requestDocument(accessToken, { id }),
  });

  return { requestDocument: mutate, isLoading: isPending };
}
