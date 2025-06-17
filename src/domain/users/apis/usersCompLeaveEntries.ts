import api, { generateAuthHeader } from '@/shared/api';

export async function getUserCompLeaveEntries(accessToken: string, { userUniqueId }: { userUniqueId: string }) {
  return api
    .get(`api/v1/users/${userUniqueId}/comp/leave/entries`, { headers: generateAuthHeader(accessToken) })
    .json<UserCompLeaveEntry[]>();
}
