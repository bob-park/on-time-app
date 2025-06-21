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
