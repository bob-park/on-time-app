import api from '@/shared/api';

export async function createUserNotification({
  userUniqueId,
  type,
  notificationToken,
}: {
  userUniqueId: string;
  type: NotificationType;
  notificationToken: string;
}) {
  return api
    .post(`api/v1/users/${userUniqueId}/notification`, {
      json: { type, options: { token: notificationToken } },
    })
    .json<UserNotificationProvider>();
}

export async function deleteUserNotificationProvider({
  userUniqueId,
  userProviderId,
}: {
  userUniqueId: string;
  userProviderId: string;
}) {
  return api.delete(`api/v1/users/${userUniqueId}/notification/${userProviderId}`).json<{ id: string }>();
}
