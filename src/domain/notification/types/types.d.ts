type NotificationType = 'IOS' | 'ANDROID';

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
}
