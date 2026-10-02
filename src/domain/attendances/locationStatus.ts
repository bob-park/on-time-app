export type LocationStatus = 'checking' | 'valid' | 'invalid' | 'denied' | 'failed';

export function getLocationStatus({
  permissionDenied,
  failed,
  hasLocation,
  invalid,
}: {
  permissionDenied: boolean;
  failed: boolean;
  hasLocation: boolean;
  invalid: boolean;
}): LocationStatus {
  if (permissionDenied) return 'denied';
  if (failed) return 'failed';
  if (!hasLocation) return 'checking';
  return invalid ? 'invalid' : 'valid';
}
