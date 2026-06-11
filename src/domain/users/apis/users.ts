import api, { generateAuthHeader } from '@/shared/api';

export async function getUserDetail(accessToken: string, { id }: { id: string }) {
  return api
    .get(`api/v1/users/${id}/summary`, {
      headers: generateAuthHeader(accessToken),
    })
    .json<UserDetail>();
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
