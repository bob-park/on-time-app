import api, { generateAuthHeader } from '@/shared/api';
import delay from '@/utils/delay';

export async function getAttendanceRecords(
  accessToken: string,
  searchParams: { userUniqueId: string; startDate: string; endDate: string },
) {
  return api
    .get('api/v2/attendance/records', {
      headers: generateAuthHeader(accessToken),
      searchParams,
    })
    .json<AttendanceRecord[]>();
}

export async function clockIn(
  accessToken: string,
  {
    userUniqueId,
    workType,
    latitude,
    longitude,
  }: Readonly<{ userUniqueId: string; workType: AttendanceWorkType; latitude: number; longitude: number }>,
) {
  const result = await api
    .post('api/v2/attendance/records/clock/in', {
      headers: generateAuthHeader(accessToken),
      json: {
        userUniqueId,
        workType,
        latitude,
        longitude,
      },
    })
    .json<AttendanceRecord>();

  await delay(1_000);

  return result;
}

export async function clockOut(
  accessToken: string,
  {
    userUniqueId,
    attendanceRecordId,
    latitude,
    longitude,
  }: Readonly<{ userUniqueId: string; attendanceRecordId: string; latitude: number; longitude: number }>,
) {
  const result = await api
    .post('api/v2/attendance/records/clock/out', {
      headers: generateAuthHeader(accessToken),
      json: {
        userUniqueId,
        attendanceRecordId,
        latitude,
        longitude,
      },
    })
    .json<AttendanceRecord>();

  await delay(1_000);

  return result;
}
