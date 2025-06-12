type AttendanceStatus = 'WAITING' | 'SUCCESS' | 'WARNING';
type DayOffType = 'DAY_OFF' | 'AM_HALF_DAY_OFF' | 'PM_HALF_DAY_OFF';
type AttendanceWorkType = 'OFFICE' | 'OUTSIDE' | 'HOME';

interface AttendanceGps {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface AttendanceRecord {
  id: number;
  userUniqueId: string;
  workType: AttendanceWorkType;
  status: AttendanceStatus;
  dayOffType?: DayOffType;
  workingDate: Date;
  clockInTime?: Date;
  clockInLatitude?: number;
  clockInLongitude?: number;
  leaveWorkAt?: Date;
  clockOutTime?: Date;
  clockOutLatitude?: number;
  clockOutLongitude?: number;
  message?: string;
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}
