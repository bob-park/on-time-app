import api, { generateAuthHeader } from '@/shared/api';

export async function requestDocument(accessToken: string, { id }: { id: number }) {
  return api
    .post(`api/v1/documents/${id}/request`, {
      headers: generateAuthHeader(accessToken),
    })
    .json<DocumentResponse>();
}
