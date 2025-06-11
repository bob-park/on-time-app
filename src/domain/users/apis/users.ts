import ky from 'ky';

const DEFAULT_USER_SERVICE_HOST = process.env.EXPO_PUBLIC_USER_SERVICE_HOST;

export async function getUserDetail(uniqueId: string) {
  return ky.get(`${DEFAULT_USER_SERVICE_HOST}/api/v1/users/${uniqueId}`).json<UserDetail>();
}
