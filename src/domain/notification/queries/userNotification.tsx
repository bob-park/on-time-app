import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createUserNotification,
  getUserNotifications,
  updateUserNotificationProvider,
} from '@/domain/notification/apis/userNotification';

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

export function useUserNotifications({ userUniqueId }: { userUniqueId?: string }) {
  const { data, isLoading } = useQuery<UserNotificationProvider[]>({
    queryKey: ['users', userUniqueId, 'notifications'],
    queryFn: () => getUserNotifications({ userUniqueId: userUniqueId || '' }),
    enabled: !!userUniqueId,
  });

  return { notificationProviders: data || [], isLoading };
}

export function useUpdateUserNotification(
  { userUniqueId }: { userUniqueId: string },
  { onSuccess }: QueryHandler<UserNotificationProvider>,
) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', userUniqueId, 'notification', 'update'],
    mutationFn: ({ userProviderId, enabled }: { userProviderId: string; enabled: boolean }) =>
      updateUserNotificationProvider({ userUniqueId, userProviderId, enabled }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users', userUniqueId, 'notifications'] });
    },
  });

  return { updateProvider: mutate, isLoading: isPending };
}
