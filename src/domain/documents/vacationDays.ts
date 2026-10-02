import dayjs from '@/shared/dayjs';

// 신청 전 미리보기용 예상 사용 일수. 주말만 제외한다.
// ponytail: 공휴일은 반영하지 않음 — 서버 공휴일 API 가 생기면 함께 제외.
export function countRequestedDays({
  startDate,
  endDate,
  subType,
}: {
  startDate: Date;
  endDate: Date;
  subType?: VacationSubType;
}): number {
  if (dayjs(startDate).isAfter(endDate, 'day')) return 0;
  if (subType) return 0.5;

  let count = 0;
  for (let d = dayjs(startDate).startOf('day'); !d.isAfter(endDate, 'day'); d = d.add(1, 'day')) {
    if (d.day() !== 0 && d.day() !== 6) count += 1;
  }
  return count;
}
