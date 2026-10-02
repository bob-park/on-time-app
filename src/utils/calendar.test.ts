/// <reference types="jest" />
import { buildMonthGrid } from '@/utils/calendar';

// 로컬 Date 생성자로 만들어 타임존과 무관하게 결정적으로 만든다.
describe('buildMonthGrid', () => {
  it('2026-10 (1일 목요일, 31일) → 5주 35칸, 9/27(일) 시작, 10/31(토) 끝', () => {
    const grid = buildMonthGrid(new Date(2026, 9, 15));
    expect(grid).toHaveLength(35);
    expect(grid[0]).toEqual(new Date(2026, 8, 27));
    expect(grid[34]).toEqual(new Date(2026, 9, 31));
  });

  it('2026-08 (1일 토요일, 31일) → 6주 42칸', () => {
    const grid = buildMonthGrid(new Date(2026, 7, 1));
    expect(grid).toHaveLength(42);
    expect(grid[0]).toEqual(new Date(2026, 6, 26));
    expect(grid[6]).toEqual(new Date(2026, 7, 1));
    expect(grid[41]).toEqual(new Date(2026, 8, 5));
  });

  it('2026-02 (1일 일요일, 28일) → 4주 28칸', () => {
    const grid = buildMonthGrid(new Date(2026, 1, 10));
    expect(grid).toHaveLength(28);
    expect(grid[0]).toEqual(new Date(2026, 1, 1));
    expect(grid[27]).toEqual(new Date(2026, 1, 28));
  });

  it('모든 칸은 자정이고 하루씩 증가한다', () => {
    const grid = buildMonthGrid(new Date(2026, 9, 2, 15, 30));
    grid.forEach((date, i) => {
      expect(date.getHours()).toBe(0);
      if (i > 0) expect(date.getDate()).not.toBe(grid[i - 1].getDate());
    });
  });
});
