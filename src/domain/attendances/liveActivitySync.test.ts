/// <reference types="jest" />
import { decideActivitySync } from './liveActivitySync';

const base = {
  id: 1,
  userUniqueId: 'u',
  workType: 'OFFICE',
  status: 'SUCCESS',
  workingDate: new Date(),
  createdDate: new Date(),
  createdBy: 'u',
} as any;

describe('decideActivitySync', () => {
  it('근무 중이고 Activity 없으면 start', () => {
    const today = {
      ...base,
      clockInTime: new Date('2026-06-30T09:00:00Z'),
      leaveWorkAt: new Date('2026-06-30T18:00:00Z'),
    };
    expect(decideActivitySync(today, false)).toEqual({
      action: 'start',
      input: { clockInAt: '2026-06-30T09:00:00.000Z', targetLeaveAt: '2026-06-30T18:00:00.000Z' },
    });
  });

  it('근무 중이고 Activity 있으면 none', () => {
    const today = {
      ...base,
      clockInTime: new Date('2026-06-30T09:00:00Z'),
      leaveWorkAt: new Date('2026-06-30T18:00:00Z'),
    };
    expect(decideActivitySync(today, true)).toEqual({ action: 'none' });
  });

  it('퇴근했는데 Activity 있으면 end', () => {
    const today = {
      ...base,
      clockInTime: new Date('2026-06-30T09:00:00Z'),
      clockOutTime: new Date('2026-06-30T18:00:00Z'),
    };
    expect(decideActivitySync(today, true)).toEqual({ action: 'end' });
  });

  it('출근 전이면 none', () => {
    expect(decideActivitySync(undefined, false)).toEqual({ action: 'none' });
  });

  it('출근 전인데 Activity 있으면 end', () => {
    expect(decideActivitySync(undefined, true)).toEqual({ action: 'end' });
  });

  it('근무 중이나 targetLeaveAt 없으면 clockInAt 기준 8시간 후로 start', () => {
    const today = { ...base, clockInTime: new Date('2026-06-30T09:00:00Z') };
    expect(decideActivitySync(today, false)).toEqual({
      action: 'start',
      input: { clockInAt: '2026-06-30T09:00:00.000Z', targetLeaveAt: '2026-06-30T17:00:00.000Z' },
    });
  });
});
