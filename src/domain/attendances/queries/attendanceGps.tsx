import { useContext } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getLocations } from '@/domain/attendances/apis/attendanceGps';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

export function useAttendanceLocations() {
  // context
  const { accessToken } = useContext(AuthContext);

  const { data, isLoading } = useQuery<AttendanceGps[]>({
    queryKey: ['attendances', 'gps'],
    queryFn: () => getLocations(accessToken),
  });

  return { locations: data, isLoading };
}
