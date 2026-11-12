import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useActiveReservation } from '@/features/reservations/queries';
import { monotonicNow, remainingMs } from '@/features/reservations/timer';

import { NOTIFICATION_TEXT } from './messages';
import { RESERVATIONS_CHANNEL_ID, REMINDER_TYPE, ensureReservationsChannel, registerThisPhone, usePushPermission } from './push';
import { leadMinutes, reminderDelaySeconds } from './reminder';

const REMINDER_ID = 'reservation-reminder';

/**
 * Keeps this phone registered for the diner's notifications while the session lasts: on start, when the permission
 * is granted, on returning to the app (it may have been enabled in the settings) and when the system rotates the token.
 */
export function usePushRegistration() {
  const permission = usePushPermission((store) => store.state);

  useEffect(() => {
    void ensureReservationsChannel();
    void usePushPermission.getState().refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void usePushPermission.getState().refresh();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (permission !== 'granted') return;
    void registerThisPhone();
    const subscription = Notifications.addPushTokenListener(() => void registerThisPhone());
    return () => subscription.remove();
  }, [permission]);
}

function openReservation(response: Notifications.NotificationResponse | null) {
  const id = response?.notification.request.content.data?.reservationId;
  if (typeof id === 'string' && id) router.push({ pathname: '/reserva/[id]', params: { id } });
}

/** Tapping a notification opens its reservation, also when it started the app from closed. */
export function useNotificationNavigation() {
  useEffect(() => {
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      openReservation(response);
      return Notifications.clearLastNotificationResponseAsync();
    });
    const subscription = Notifications.addNotificationResponseReceivedListener(openReservation);
    return () => subscription.remove();
  }, []);
}

/**
 * The local «vence pronto» reminder of the active reservation: scheduled while it is active and granted, replaced when
 * the reservation changes, cancelled when it ends (check-in, cancel, expiry) or on sign-out (this group unmounts).
 */
export function useReservationReminder() {
  const { data: reservation } = useActiveReservation();
  const permission = usePushPermission((store) => store.state);

  useEffect(() => {
    if (!reservation || reservation.status !== 'active' || permission !== 'granted') return;
    const left = remainingMs(reservation.expiresAt, reservation.serverTime, reservation.receivedAt, monotonicNow());
    const duration = Date.parse(reservation.expiresAt) - Date.parse(reservation.createdAt);
    const seconds = reminderDelaySeconds(left, duration);
    if (seconds === null) return;

    void Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: NOTIFICATION_TEXT.reminderTitle,
        body: NOTIFICATION_TEXT.reminderBody(reservation.restaurant.name, leadMinutes(duration)),
        data: { type: REMINDER_TYPE, reservationId: reservation.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId: RESERVATIONS_CHANNEL_ID,
      },
    });
    return () => {
      void Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
    };
  }, [reservation, permission]);
}
