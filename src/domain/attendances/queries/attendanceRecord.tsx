import { useContext } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getAttendanceRecords } from '@/domain/attendances/apis/attendanceRecord';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

export function useAttendanceRecords({ startDate, endDate }: { startDate: string; endDate: string }) {
  // contenxt
  const { user, accessToken } = useContext(AuthContext);

  const { data, isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendances', 'records', { startDate, endDate }],
    queryFn: () =>
      getAttendanceRecords(accessToken || '', {
        userUniqueId: user?.uniqueId || '',
        startDate,
        endDate,
      }),
    enabled: !!accessToken,
  });

  return { records: data || [], isLoading };
}
