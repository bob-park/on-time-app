import api, { generateAuthHeader } from '@/shared/api';

export async function getUserDetail(id: string) {
  return api.get(`api/v1/users/${id}`).json<UserDetail>();
}

export async function getUserLeaveEntry(accessToken: string, { id, year }: { id: string; year: number }) {
  return api
    .get(`api/v1/users/${id}/leave/entries`, {
      headers: generateAuthHeader(accessToken),
      searchParams: {
        year,
      },
    })
    .json<UserLeaveEntry>();
}
