import { env } from '@/config/env';
import { apiRequest } from '@/lib/api/client';

export type PushPlatform = 'android' | 'ios';

/** The phones of the diner that receive reservation notifications (Sprint 4, `/v1/notifications/devices`). */
export interface NotificationsApi {
  register(token: string, platform: PushPlatform): Promise<void>;
  unregister(token: string): Promise<void>;
}

const httpNotificationsApi: NotificationsApi = {
  register: (token, platform) =>
    apiRequest<void>('/notifications/devices', { method: 'PUT', body: { token, platform } }),
  unregister: (token) => apiRequest<void>('/notifications/devices', { method: 'DELETE', body: { token } }),
};

/** With the examples there is no backend to send pushes: registering does nothing (local reminders still work). */
const mockNotificationsApi: NotificationsApi = {
  register: () => Promise.resolve(),
  unregister: () => Promise.resolve(),
};

export const notificationsApi: NotificationsApi = env.useMocks ? mockNotificationsApi : httpNotificationsApi;
