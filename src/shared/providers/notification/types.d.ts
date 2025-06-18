interface NotificationMessage {
  id: string;
  title: string;
  message?: string;
  read: boolean;
  createdDate: Date;
}
