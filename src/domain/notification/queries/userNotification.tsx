import { useContext } from 'react';

import { InfiniteData, QueryKey, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createUserNotification,
  getUserNotifications,
  read,
  searchHistories,
  updateUserNotificationProvider,
} from '@/domain/notification/apis/userNotification';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

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

export function useReadNotification({ onSuccess }: QueryHandler<UserNotificationHistory>) {
  const queryClient = useQueryClient();

  // context
  const { accessToken, userDetail } = useContext(AuthContext);

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', userDetail?.uniqueId, 'notifications', 'read'],
    mutationFn: (historyId: string) => read(accessToken, { userUniqueId: userDetail?.uniqueId || '', historyId }),
    onSuccess: (data) => {
      onSuccess && onSuccess(data);

      queryClient.invalidateQueries({ queryKey: ['users', userDetail?.uniqueId, 'notifications'] });
    },
  });

  return { read: mutate, isLoading: isPending };
}

export function useNotificationHistories(params: { isRead?: boolean } & PageRequest) {
  // context
  const { accessToken, userDetail } = useContext(AuthContext);

  const { data, isLoading, fetchNextPage, refetch } = useInfiniteQuery<
    Page<UserNotificationHistory>,
    unknown,
    InfiniteData<Page<UserNotificationHistory>>,
    QueryKey,
    PageRequest
  >({
    enabled: !!userDetail?.uniqueId,
    queryKey: ['users', userDetail?.uniqueId, 'notifications', params],
    queryFn: async ({ pageParam }) =>
      searchHistories(accessToken, { ...params, userUniqueId: userDetail?.uniqueId || '' }),
    initialPageParam: {
      size: 25,
      page: 0,
    },
    getNextPageParam: (lastPage, allPages) => {
      let totalPage = Math.ceil(lastPage.total / lastPage.pageable.pageSize);

      if (lastPage.total % lastPage.pageable.pageSize > 0) {
        totalPage = totalPage + 1;
      }

      const page = {
        size: lastPage.pageable.pageSize,
        page: lastPage.pageable.pageNumber,
      };
      const nextPage = page.page + 1;

      if (nextPage > totalPage) {
        return null;
      }

      return {
        size: page.size,
        page: nextPage,
      };
    },
    staleTime: 60 * 1_000,
    gcTime: 5 * 60 * 1_000,
  });

  return { pages: data?.pages || ([] as Page<UserNotificationHistory>[]), isLoading, fetchNextPage, refetch };
}
