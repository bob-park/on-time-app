import api, { generateAuthHeader } from '@/shared/api';

export async function createUserNotification(
  accessToken: string,
  {
    userUniqueId,
    type,
    notificationToken,
  }: { userUniqueId: string; type: NotificationType; notificationToken: string },
) {
  return api
    .post(`api/v1/users/${userUniqueId}/notification`, {
      headers: generateAuthHeader(accessToken),
      json: { type, options: { token: notificationToken } },
    })
    .json<User>();
}
