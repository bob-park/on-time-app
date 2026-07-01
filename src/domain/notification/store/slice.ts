import { BoundState } from '@/shared/store/rootStore';

import { SlicePattern } from 'zustand';

import { NotificationState } from './notifications.state';

const createNotificationSlice: SlicePattern<NotificationState, BoundState> = (set) => ({
  setUserProviderId: (id) => set(() => ({ userProviderId: id }), false, { type: 'notification/setUserProviderId' }),
});

export default createNotificationSlice;
