type NotificationType = 'IOS' | 'ANDROID' | 'SLACK' | 'SMTP';

interface NotificationProvider {
  id: number;
  type: NotificationType;
  name: string;
  options?: {
    token: string;
  };
}

interface UserNotificationProvider {
  id: string;
  provider: NotificationProvider;
  user?: User;
  enabled: boolean;
}

interface UserNotificationHistory {
  id: string;
  userUniqueId: string;
  title: string;
  contents?: string;
  isRead: boolean;
  createdDate: Date;
  lastModifiedDate?: Date;
}
