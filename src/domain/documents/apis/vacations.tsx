import api, { generateAuthHeader } from '@/shared/api';
import dayjs from '@/shared/dayjs';
import delay from '@/utils/delay';

export async function getVacations(
  accessToken: string,
  searchParams: {
    userUniqueId?: string;
    status?: ApprovalStatus;
    startDateFrom: Date;
    endDateFrom: Date;
  } & PageRequest,
) {
  const result = await api
    .get('api/v1/documents/vacations', {
      headers: generateAuthHeader(accessToken),
      searchParams: {
        ...searchParams,
        startDateFrom: dayjs(searchParams.startDateFrom).format('YYYY-MM-DD'),
        endDateFrom: dayjs(searchParams.endDateFrom).format('YYYY-MM-DD'),
      },
    })
    .json<Page<DocumentVacation>>();

  return result;
}

export async function createVacation(accessToken: string, req: CreateDocumentVacationRequest) {
  const result = await api
    .post('api/v1/documents/vacations', {
      headers: generateAuthHeader(accessToken),
      json: req,
    })
    .json<DocumentVacation>();

  await delay(1_000);

  return result;
}
