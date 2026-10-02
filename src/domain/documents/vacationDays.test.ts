/// <reference types="jest" />
import { countRequestedDays } from '@/domain/documents/vacationDays';

// 2026-10-02 금, 10-03 토, 10-04 일, 10-05 월
describe('countRequestedDays', () => {
  it('평일 하루는 1일', () => {
    expect(countRequestedDays({ startDate: new Date(2026, 9, 2), endDate: new Date(2026, 9, 2) })).toBe(1);
  });

  it('금~월은 주말을 빼고 2일', () => {
    expect(countRequestedDays({ startDate: new Date(2026, 9, 2), endDate: new Date(2026, 9, 5) })).toBe(2);
  });

  it('반차는 0.5일', () => {
    expect(
      countRequestedDays({
        startDate: new Date(2026, 9, 2),
        endDate: new Date(2026, 9, 2),
        subType: 'AM_HALF_DAY_OFF',
      }),
    ).toBe(0.5);
  });

  it('주말만 고르면 0일', () => {
    expect(countRequestedDays({ startDate: new Date(2026, 9, 3), endDate: new Date(2026, 9, 4) })).toBe(0);
  });

  it('종료일이 시작일보다 빠르면 0일', () => {
    expect(countRequestedDays({ startDate: new Date(2026, 9, 5), endDate: new Date(2026, 9, 2) })).toBe(0);
  });
});
