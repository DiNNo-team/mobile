import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import { create } from 'zustand';

import { env } from '@/config/env';

import { notificationsApi } from './api';
import { NOTIFICATION_TEXT } from './messages';

/** Same id as the backend (`ANDROID_CHANNEL_ID`): the remote notifications land in this channel. */
export const RESERVATIONS_CHANNEL_ID = 'reservations';

/** `data.type` of the local reminder; the backend sends created, cancelled, expired and checked_in. */
export const REMINDER_TYPE = 'reminder';

/**
 * With the app open the screen already tells what happened (the reservation, a toast from the socket), so remote
 * notifications go only to the tray. The local reminder does show as a banner: the diner may be on another screen.
 */
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isReminder = notification.request.content.data?.type === REMINDER_TYPE;
    return { shouldShowBanner: isReminder, shouldShowList: true, shouldPlaySound: isReminder, shouldSetBadge: false };
  },
});

/** Android 8+: notifications need a channel; created once, its name shows in the phone's settings. */
export async function ensureReservationsChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(RESERVATIONS_CHANNEL_ID, {
    name: NOTIFICATION_TEXT.channelName,
    description: NOTIFICATION_TEXT.channelDescription,
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: '#F46935',
  });
}

export type PermissionState = 'unknown' | 'granted' | 'undetermined' | 'blocked';

function toState(status: Notifications.NotificationPermissionsStatus): PermissionState {
  if (status.granted) return 'granted';
  return status.canAskAgain ? 'undetermined' : 'blocked';
}

interface PermissionStore {
  state: PermissionState;
  /** Reads the system permission again (on start and on returning to the app: it may change in the settings). */
  refresh: () => Promise<PermissionState>;
  /** Shows the system dialog when it can; when it is blocked, opens the app's settings. */
  request: () => Promise<PermissionState>;
}

export const usePushPermission = create<PermissionStore>((set, get) => ({
  state: 'unknown',
  refresh: async () => {
    const state = toState(await Notifications.getPermissionsAsync());
    set({ state });
    return state;
  },
  request: async () => {
    if (get().state === 'blocked') {
      await Linking.openSettings();
      return 'blocked';
    }
    await ensureReservationsChannel();
    const state = toState(await Notifications.requestPermissionsAsync());
    set({ state });
    return state;
  },
}));

/**
 * After the first reservation, when the value is obvious («te avisamos si se vence»), not at sign-in. Only when the
 * system can still ask: it never sends the diner to the settings by surprise.
 */
export async function askAfterReserving(): Promise<void> {
  const state = await usePushPermission.getState().refresh();
  if (state === 'undetermined') await usePushPermission.getState().request();
}

/** The token registered in this session, to forget it on sign-out. */
let registeredToken: string | null = null;

/**
 * Remote push: only Android, with FCM (`google-services.json` in the build). iOS without the paid Apple program has no
 * remote push: it keeps the local reminder. Never throws: notifications never block the app.
 */
export async function registerThisPhone(): Promise<boolean> {
  if (env.useMocks || Platform.OS !== 'android') return false;
  try {
    const { data: token } = await Notifications.getDevicePushTokenAsync();
    if (typeof token !== 'string' || token === registeredToken) return token === registeredToken;
    await notificationsApi.register(token, 'android');
    registeredToken = token;
    return true;
  } catch {
    // No FCM in this build, no network or the backend refused: the next start tries again.
    return false;
  }
}

/** Before signing out, so the next account on this phone does not get this diner's notifications. Best effort. */
export async function unregisterThisPhone(timeoutMs = 3000): Promise<void> {
  const token = registeredToken;
  if (!token) return;
  registeredToken = null;
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  await Promise.race([notificationsApi.unregister(token).catch(() => undefined), timeout]);
}
