/// <reference types="jest" />
import { computeWorkActivityProps } from './computeProps';

// Inputs are built with the LOCAL Date constructor (not UTC "…Z" literals) so
// that `targetLabel` — which is a wall-clock time and therefore timezone
// dependent — is deterministic on any machine: `new Date(2026, 5, 30, 18, 0)`
// is always local 18:00, so `targetLabel` is always "18:00". Duration math
// (remaining/worked/progress) uses getTime() diffs and is timezone-independent.
const clockIn = new Date(2026, 5, 30, 9, 0, 0); // local 09:00
const target = new Date(2026, 5, 30, 18, 0, 0); // local 18:00 → 9h shift

const input = { clockInAt: clockIn.toISOString(), targetLeaveAt: target.toISOString() };

// Build a local Date `hours`:`minutes` on the same shift day.
function at(hours: number, minutes: number): Date {
  return new Date(2026, 5, 30, hours, minutes, 0);
}

describe('computeWorkActivityProps', () => {
  it('근무 중반(4.5h): progress 0.5, H:MM 라벨 + compact + targetLabel', () => {
    const props = computeWorkActivityProps(input, at(13, 30)); // 4.5h in

    expect(props).toEqual({
      clockInAt: input.clockInAt,
      targetLeaveAt: input.targetLeaveAt,
      progress: 0.5,
      remainingLabel: '4:30',
      workedLabel: '4:30',
      remainingCompact: '4h',
      workedCompact: '4h',
      targetLabel: '18:00',
      isOvertime: false,
    });
  });

  it('남은 4h12m → remaining 4:12 / compact 4h (compact는 시간 내림)', () => {
    const props = computeWorkActivityProps(input, at(13, 48)); // remaining 4h12m, worked 4h48m

    expect(props.remainingLabel).toBe('4:12');
    expect(props.remainingCompact).toBe('4h');
    expect(props.workedLabel).toBe('4:48');
    expect(props.workedCompact).toBe('4h');
    expect(props.isOvertime).toBe(false);
  });

  it('남은 20m → remaining 0:20 / compact 20m (60분 미만은 분 표기)', () => {
    const props = computeWorkActivityProps(input, at(17, 40)); // remaining 20m

    expect(props.remainingLabel).toBe('0:20');
    expect(props.remainingCompact).toBe('20m');
    expect(props.workedLabel).toBe('8:40');
    expect(props.workedCompact).toBe('8h');
  });

  it('출근 직후: worked 0:00/0m, remaining 9:00/9h, progress 0', () => {
    const props = computeWorkActivityProps(input, clockIn);

    expect(props.workedLabel).toBe('0:00');
    expect(props.workedCompact).toBe('0m');
    expect(props.remainingLabel).toBe('9:00');
    expect(props.remainingCompact).toBe('9h');
    expect(props.progress).toBe(0);
    expect(props.isOvertime).toBe(false);
    expect(props.targetLabel).toBe('18:00');
  });

  it('초과 근무: isOvertime true, remaining 자리에 초과분 +카운트업, worked 증가, progress 1', () => {
    const props = computeWorkActivityProps(input, at(19, 15)); // 1h15 past target, 10h15 worked

    expect(props.isOvertime).toBe(true);
    expect(props.remainingLabel).toBe('+1:15');
    expect(props.remainingCompact).toBe('+1h');
    expect(props.workedLabel).toBe('10:15');
    expect(props.workedCompact).toBe('10h');
    expect(props.progress).toBe(1);
  });

  it('한참 초과: progress는 1을 넘지 않고 정확히 1, 초과분 +카운트업', () => {
    const props = computeWorkActivityProps(input, at(23, 0)); // 5h past target (14h worked > 9h shift)

    expect(props.progress).toBe(1);
    expect(props.isOvertime).toBe(true);
    expect(props.remainingLabel).toBe('+5:00');
    expect(props.remainingCompact).toBe('+5h');
  });
});
