// day of week
import dayjs from 'dayjs';
import { padStart } from 'lodash';

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

export function getDaysOfWeek(day: number): string {
  return daysOfWeek[day];
}

export function getWeekStartDate(date: Date): Date {
  const dayOfWeek = dayjs(date).day();

  if (dayOfWeek < 1) {
    return dayjs(date).add(-6, 'day').toDate();
  }

  return dayjs(date).day(1).toDate();
}

export function getDuration(startDate: Date, endDate: Date): number {
  return Math.abs(dayjs(endDate).unix() - dayjs(startDate).unix());
}

export function round(value: number, loc: number): number {
  const pow = Math.pow(10, loc);

  return Math.round(value * pow) / pow;
}

export function parseTimeFormat(seconds: number): string {
  const min = Math.floor((seconds / 60) % 60);
  const hours = Math.floor(seconds / 3_600);

  return `${hours > 0 ? hours + '시간' : ''} ${min > 9 ? padStart(min + '', 2, '0') : min}분`;
}
