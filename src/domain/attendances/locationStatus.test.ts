/// <reference types="jest" />
import { getLocationStatus } from '@/domain/attendances/locationStatus';

const base = { permissionDenied: false, failed: false, hasLocation: false, invalid: false };

describe('getLocationStatus', () => {
  it('권한 거부가 가장 우선', () => {
    expect(getLocationStatus({ ...base, permissionDenied: true, failed: true })).toBe('denied');
  });

  it('위치를 가져오다 실패하면 checking 에 머물지 않고 failed', () => {
    expect(getLocationStatus({ ...base, failed: true })).toBe('failed');
  });

  it('아직 위치가 없으면 checking', () => {
    expect(getLocationStatus(base)).toBe('checking');
  });

  it('위치가 있으면 반경 판정에 따라 valid / invalid', () => {
    expect(getLocationStatus({ ...base, hasLocation: true })).toBe('valid');
    expect(getLocationStatus({ ...base, hasLocation: true, invalid: true })).toBe('invalid');
  });
});
