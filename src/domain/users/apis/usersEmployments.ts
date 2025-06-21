import api, { generateAuthHeader } from '@/shared/api';

export async function getUserEmployment(accessToken: string, { userUniqueId }: { userUniqueId: string }) {
  return api
    .get(`api/v1/users/${userUniqueId}/employments`, { headers: generateAuthHeader(accessToken) })
    .json<UserEmployment>();
}
