import { useContext } from 'react';

import { useMutation } from '@tanstack/react-query';

import { createUserNotification } from '@/domain/notification/apis/userNotification';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

export function useUserNotification({ userUniqueId }: { userUniqueId: string }) {
  // context
  const { accessToken } = useContext(AuthContext);

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', userUniqueId, 'notification', 'create'],
    mutationFn: (req: { type: NotificationType; notificationToken: string }) =>
      createUserNotification(accessToken, { ...req, userUniqueId }),
  });

  return { createUserNotification: mutate, isLoading: isPending };
}
