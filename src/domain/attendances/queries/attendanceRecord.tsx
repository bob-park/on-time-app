import { useContext } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clockIn, clockOut, getAttendanceRecords } from '@/domain/attendances/apis/attendanceRecord';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

export function useTodayAttendance() {
  const now = dayjs().format('YYYY-MM-DD');

  // context
  const { userDetail, accessToken } = useContext(AuthContext);

  const { data, isLoading, refetch } = useQuery<AttendanceRecord>({
    queryKey: ['attendances', now],
    queryFn: () =>
      getAttendanceRecords(accessToken || '', {
        userUniqueId: userDetail?.id || '',
        startDate: now,
        endDate: now,
      }).then((data) => data[0]),
    enabled: !!accessToken,
  });

  return { today: data, isLoading, reloadToday: refetch };
}

export function useClockIn({ onSuccess }: QueryHandler<AttendanceRecord>) {
  // context
  const { userDetail, accessToken } = useContext(AuthContext);

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
    }) => clockIn(accessToken, { userUniqueId: userDetail?.id || '', workType, latitude, longitude }),
    onSuccess: (data) => {
      queryClient.setQueryData(['attendances', dayjs(data.workingDate).format('YYYY-MM-DD')], data);

      onSuccess && onSuccess(data);
    },
  });

  return { clockIn: mutate, isLoading: isPending };
}

export function useClockOut({ onSuccess }: QueryHandler<AttendanceRecord>) {
  // context
  const { userDetail, accessToken } = useContext(AuthContext);

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
    }) => clockOut(accessToken, { userUniqueId: userDetail?.id || '', attendanceRecordId, latitude, longitude }),
    onSuccess: (data) => {
      queryClient.setQueryData(['attendances', dayjs(data.workingDate).format('YYYY-MM-DD')], data);

      onSuccess && onSuccess(data);
    },
  });

  return { clockOut: mutate, isLoading: isPending };
}
