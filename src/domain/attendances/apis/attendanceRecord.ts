import api from '@/shared/api';

export async function getAttendanceRecords(
  accessToken: string,
  searchParams: { userUniqueId: string; startDate: string; endDate: string },
) {
  return api
    .get('api/v1/attendance/records', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      searchParams,
    })
    .json<AttendanceRecord[]>();
}
