/// <reference types="jest" />
import { getHomeCta, getWorkState } from '@/domain/attendances/workState';

const base = {
  id: 1,
  userUniqueId: 'u',
  workType: 'OFFICE',
  status: 'WAITING',
  workingDate: new Date(2026, 9, 2),
  createdDate: new Date(2026, 9, 2),
  createdBy: 'u',
} as AttendanceRecord;

const clockIn = new Date(2026, 9, 2, 9, 0);
const leave = new Date(2026, 9, 2, 18, 0);

describe('getWorkState', () => {
  it('기록이 없거나 출근 전이면 before', () => {
    expect(getWorkState(undefined)).toBe('before');
    expect(getWorkState(base)).toBe('before');
  });

  it('출근 후 목표 퇴근 + 30분 이내면 working', () => {
    const today = { ...base, clockInTime: clockIn, leaveWorkAt: leave };
    expect(getWorkState(today, new Date(2026, 9, 2, 14, 0))).toBe('working');
    expect(getWorkState(today, new Date(2026, 9, 2, 18, 30))).toBe('working');
  });

  it('목표 퇴근 + 30분을 넘기면 overtime', () => {
    const today = { ...base, clockInTime: clockIn, leaveWorkAt: leave };
    expect(getWorkState(today, new Date(2026, 9, 2, 18, 31))).toBe('overtime');
  });

  it('퇴근 기록이 있으면 done', () => {
    const today = { ...base, clockInTime: clockIn, leaveWorkAt: leave, clockOutTime: new Date(2026, 9, 2, 18, 5) };
    expect(getWorkState(today, new Date(2026, 9, 2, 23, 0))).toBe('done');
  });
});

describe('getHomeCta', () => {
  it('로딩 중에는 어떤 상태든 숨긴다', () => {
    expect(getHomeCta('before', true)).toBeNull();
    expect(getHomeCta('working', true)).toBeNull();
  });

  it('출근 전이면 출근하기 (주말 포함 — 호출부가 주말을 따로 거르지 않는다)', () => {
    expect(getHomeCta('before', false)).toBe('출근하기');
  });

  it('근무중·초과근무면 퇴근하기', () => {
    expect(getHomeCta('working', false)).toBe('퇴근하기');
    expect(getHomeCta('overtime', false)).toBe('퇴근하기');
  });

  it('퇴근 완료면 숨긴다', () => {
    expect(getHomeCta('done', false)).toBeNull();
  });
});
