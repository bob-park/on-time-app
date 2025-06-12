import ky from 'ky';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '';

export function generateAuthHeader(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

const index = ky.extend({
  prefixUrl: API_HOST,
  hooks: {
    afterResponse: [(request, options, response) => {}],
  },
});

export default index;
