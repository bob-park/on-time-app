/// <reference types="jest" />
import { computeWorkActivityProps } from './computeProps';

// Inputs are built with the LOCAL Date constructor (not UTC "…Z" literals) so
// that `clockInLabel`/`targetLabel` — wall-clock times and therefore timezone
// dependent — are deterministic on any machine: `new Date(2026, 5, 30, 18, 0)`
// is always local 18:00. Duration math (compact strings, isOvertime) uses
// getTime() diffs and is timezone-independent.
const clockIn = new Date(2026, 5, 30, 9, 0, 0); // local 09:00
const target = new Date(2026, 5, 30, 18, 0, 0); // local 18:00 → 9h shift

const input = { clockInAt: clockIn.toISOString(), targetLeaveAt: target.toISOString() };

// Build a local Date `hours`:`minutes` on the same shift day.
function at(hours: number, minutes: number): Date {
  return new Date(2026, 5, 30, hours, minutes, 0);
}

describe('computeWorkActivityProps', () => {
  it('근무 중반(4.5h): epoch ms + compact + 출근/퇴근 라벨', () => {
    const props = computeWorkActivityProps(input, at(13, 30)); // 4.5h in

    expect(props).toEqual({
      clockInAtMs: clockIn.getTime(),
      targetLeaveAtMs: target.getTime(),
      remainingCompact: '4h',
      workedCompact: '4h',
      clockInLabel: '09:00',
      targetLabel: '18:00',
      isOvertime: false,
    });
  });

  it('남은 4h12m → compact 4h (compact는 시간 내림)', () => {
    const props = computeWorkActivityProps(input, at(13, 48)); // remaining 4h12m, worked 4h48m

    expect(props.remainingCompact).toBe('4h');
    expect(props.workedCompact).toBe('4h');
    expect(props.isOvertime).toBe(false);
  });

  it('남은 20m → compact 20m (60분 미만은 분 표기)', () => {
    const props = computeWorkActivityProps(input, at(17, 40)); // remaining 20m

    expect(props.remainingCompact).toBe('20m');
    expect(props.workedCompact).toBe('8h');
  });

  it('출근 직후: worked 0m, remaining 9h', () => {
    const props = computeWorkActivityProps(input, clockIn);

    expect(props.workedCompact).toBe('0m');
    expect(props.remainingCompact).toBe('9h');
    expect(props.isOvertime).toBe(false);
    expect(props.clockInLabel).toBe('09:00');
    expect(props.targetLabel).toBe('18:00');
  });

  it('초과 근무: isOvertime true, compact는 초과분 +카운트업', () => {
    const props = computeWorkActivityProps(input, at(19, 15)); // 1h15 past target, 10h15 worked

    expect(props.isOvertime).toBe(true);
    expect(props.remainingCompact).toBe('+1h');
    expect(props.workedCompact).toBe('10h');
  });

  it('한참 초과: +5h', () => {
    const props = computeWorkActivityProps(input, at(23, 0)); // 5h past target

    expect(props.isOvertime).toBe(true);
    expect(props.remainingCompact).toBe('+5h');
  });

  it('역전 구간: targetLeaveAt이 clockInAt보다 이르면 target을 clock-in으로 클램프', () => {
    const invertedInput = {
      clockInAt: at(18, 0).toISOString(), // 18:00
      targetLeaveAt: at(9, 0).toISOString(), // 09:00 (target < clock-in)
    };
    const props = computeWorkActivityProps(invertedInput, at(19, 0)); // now past clock-in

    expect(props.targetLeaveAtMs).toBe(at(18, 0).getTime());
    expect(props.targetLeaveAtMs).toBe(props.clockInAtMs);
    expect(props.isOvertime).toBe(true);
  });
});
