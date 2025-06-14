type DocumentType = 'VACATION';
type ApprovalStatus = 'DRAFT' | 'WAITING' | 'PROCEEDING' | 'APPROVED' | 'REJECTED';

interface DocumentResponse {
  id: number;
  type: DocumentType;
  status: ApprovalStatus;
  userUniqueId: string;
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}

type VacationType = 'GENERAL' | 'COMPENSATORY' | 'OFFICIAL';
type VacationSubType = 'AM_HALF_DAY_OFF' | 'PM_HALF_DAY_OFF';

interface DocumentVacation extends DocumentResponse {
  vacationType: VacationType;
  vacationSubType?: VacationSubType;
  startDate: Date;
  endDate: Date;
  usedDays: number;
  reason?: string;
}
