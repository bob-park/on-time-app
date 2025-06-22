import { useContext } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clockIn, clockOut, getAttendanceRecords } from '@/domain/attendances/apis/attendanceRecord';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

import dayjs from 'dayjs';

export function useTodayAttendance() {
  const now = dayjs().format('YYYY-MM-DD');

  // context
  const { user, accessToken } = useContext(AuthContext);

  const { data, isLoading, refetch } = useQuery<AttendanceRecord>({
    queryKey: ['attendances', now],
    queryFn: () =>
      getAttendanceRecords(accessToken || '', {
        userUniqueId: user?.uniqueId || '',
        startDate: now,
        endDate: now,
      }).then((data) => data[0]),
    enabled: !!accessToken,
  });

  return { today: data, isLoading, reloadToday: refetch };
}

export function useClockIn({ onSuccess }: QueryHandler<AttendanceRecord>) {
  // context
  const { user, accessToken } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['attendances', 'clockIn'],
    mutationFn: ({
      workType,
      latitude,
      longitude,
    }: {
      workType: AttendanceWorkType;
      latitude: number;
      longitude: number;
    }) => clockIn(accessToken, { userUniqueId: user?.uniqueId || '', workType, latitude, longitude }),
    onSuccess: (data) => {
      queryClient.setQueryData(['attendances', data.workingDate], data);

      onSuccess && onSuccess(data);
    },
  });

  return { clockIn: mutate, isLoading: isPending };
}

export function useClockOut({ onSuccess }: QueryHandler<AttendanceRecord>) {
  // context
  const { user, accessToken } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['attendances', 'clockOut'],
    mutationFn: ({
      attendanceRecordId,
      latitude,
      longitude,
    }: {
      attendanceRecordId: number;
      latitude: number;
      longitude: number;
    }) => clockOut(accessToken, { userUniqueId: user?.uniqueId || '', attendanceRecordId, latitude, longitude }),
    onSuccess: (data) => {
      queryClient.setQueryData(['attendances', data.workingDate], data);

      onSuccess && onSuccess(data);
    },
  });

  return { clockOut: mutate, isLoading: isPending };
}
