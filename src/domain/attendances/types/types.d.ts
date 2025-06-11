type AttendanceStatus = 'WAITING' | 'SUCCESS' | 'WARNING';
type DayOffType = 'DAY_OFF' | 'AM_HALF_DAY_OFF' | 'PM_HALF_DAY_OFF';

interface AttendanceRecord {
  id: number;
  userUniqueId: string;
  status: AttendanceStatus;
  dayOffType?: DayOffType;
  workingDate: Date;
  clockInTime?: Date;
  leaveWorkAt?: Date;
  clockOutTime?: Date;
  message?: string;
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}
