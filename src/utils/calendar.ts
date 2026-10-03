import dayjs from '@/shared/dayjs';

// 해당 월을 덮는 일요일 시작 주(4~6주)의 모든 날짜.
export function buildMonthGrid(month: Date): Date[] {
  const first = dayjs(month).startOf('month');
  const start = first.subtract(first.day(), 'day');
  const weeks = Math.ceil((first.day() + first.daysInMonth()) / 7);

  return Array.from({ length: weeks * 7 }, (_, i) => start.add(i, 'day').toDate());
}
