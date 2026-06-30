import ky from 'ky';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '';

export function generateAuthHeader(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

const index = ky.extend({
  prefix: API_HOST,
  hooks: {
    afterResponse: [() => {}],
  },
});

export default index;
