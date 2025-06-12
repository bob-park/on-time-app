import api, { generateAuthHeader } from '@/shared/api';

export async function getLocations(accessToken: string) {
  return api.get('api/v1/attendance/gps', { headers: generateAuthHeader(accessToken) }).json<AttendanceGps[]>();
}
