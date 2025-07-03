import api, { generateAuthHeader } from '@/shared/api';

export async function getUserNotifications({ userUniqueId }: { userUniqueId: string }) {
  return api.get(`api/v1/users/${userUniqueId}/notification`).json<UserNotificationProvider[]>();
}

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

export async function updateUserNotificationProvider({
  userUniqueId,
  userProviderId,
  enabled,
}: {
  userUniqueId: string;
  userProviderId: string;
  enabled: boolean;
}) {
  return api
    .put(`api/v1/users/${userUniqueId}/notification/${userProviderId}`, {
      json: { enabled },
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

export async function read(
  accessToken: string,
  {
    userUniqueId,
    historyId,
  }: {
    userUniqueId: string;
    historyId: string;
  },
) {
  return api
    .post(`api/v1/users/${userUniqueId}/notifications/histories/${historyId}/read`, {
      headers: generateAuthHeader(accessToken),
    })
    .json<UserNotificationHistory>();
}

export async function searchHistories(
  accessToken: string,
  {
    userUniqueId,
    isRead,
    page,
    size,
  }: {
    userUniqueId: string;
    isRead?: boolean;
  } & PageRequest,
) {
  console.log('get notifications');

  return api
    .get(`api/v1/users/${userUniqueId}/notifications/histories`, {
      headers: generateAuthHeader(accessToken),
      searchParams: {
        isRead: isRead || '',
        page,
        size,
      },
    })
    .json<Page<UserNotificationHistory>>();
}
