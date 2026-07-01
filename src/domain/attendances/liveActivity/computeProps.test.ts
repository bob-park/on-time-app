/// <reference types="jest" />
import { computeWorkActivityProps } from './computeProps';

const CLOCK_IN = '2026-06-30T09:00:00.000Z';
const TARGET = '2026-06-30T18:00:00.000Z'; // 9h shift

const input = { clockInAt: CLOCK_IN, targetLeaveAt: TARGET };

describe('computeWorkActivityProps', () => {
  it('근무 중반: worked/remaining 라벨과 progress 0.5, isOvertime false', () => {
    const now = new Date('2026-06-30T13:30:00.000Z'); // 4.5h in
    const props = computeWorkActivityProps(input, now);

    expect(props).toEqual({
      clockInAt: CLOCK_IN,
      targetLeaveAt: TARGET,
      progress: 0.5,
      remainingLabel: '4:30',
      workedLabel: '4:30',
      isOvertime: false,
    });
  });

  it('초과 근무(now > target): isOvertime true, remaining는 초과분, progress는 1로 clamp', () => {
    const now = new Date('2026-06-30T19:15:00.000Z'); // 1h15 past target, 10h15 worked
    const props = computeWorkActivityProps(input, now);

    expect(props.isOvertime).toBe(true);
    expect(props.remainingLabel).toBe('1:15');
    expect(props.workedLabel).toBe('10:15');
    expect(props.progress).toBe(1);
  });

  it('출근 직후(now === clockIn): worked 0, remaining 전체, progress 0', () => {
    const now = new Date(CLOCK_IN);
    const props = computeWorkActivityProps(input, now);

    expect(props.workedLabel).toBe('0:00');
    expect(props.remainingLabel).toBe('9:00');
    expect(props.progress).toBe(0);
    expect(props.isOvertime).toBe(false);
  });

  it('한참 초과: progress가 1을 넘지 않고 정확히 1', () => {
    const now = new Date('2026-06-30T23:00:00.000Z'); // 14h worked > 9h shift
    const props = computeWorkActivityProps(input, now);

    expect(props.progress).toBe(1);
    expect(props.isOvertime).toBe(true);
  });
});
