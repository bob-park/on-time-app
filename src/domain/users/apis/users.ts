import api, { generateAuthHeader } from '@/shared/api';

export async function getUserDetail(uniqueId: string) {
  return api.get(`api/v1/users/${uniqueId}`).json<UserDetail>();
}

export async function getUserLeaveEntry(accessToken: string, { uniqueId, year }: { uniqueId: string; year: number }) {
  return api
    .get(`api/v1/users/${uniqueId}/leave/entries`, {
      headers: generateAuthHeader(accessToken),
      searchParams: {
        year,
      },
    })
    .json<UserLeaveEntry>();
}
