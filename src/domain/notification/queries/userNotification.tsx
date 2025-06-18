import { useMutation } from '@tanstack/react-query';

import { createUserNotification } from '@/domain/notification/apis/userNotification';

export function useUserNotification(
  { userUniqueId }: { userUniqueId: string },
  { onSuccess }: QueryHandler<UserNotificationProvider>,
) {
  const { mutate, isPending } = useMutation({
    mutationKey: ['users', userUniqueId, 'notification', 'create'],
    mutationFn: (req: { type: NotificationType; notificationToken: string }) =>
      createUserNotification({ ...req, userUniqueId }),
    onSuccess: (data) => {
      onSuccess && onSuccess(data);
    },
  });

  return { createUserNotification: mutate, isLoading: isPending };
}
