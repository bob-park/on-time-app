import api from '@/shared/api';

export async function getUserDetail(uniqueId: string) {
  return api.get(`/api/v1/users/${uniqueId}`).json<UserDetail>();
}
