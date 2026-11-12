/** Texts of the notifications in the app (Sprint 4). The remote ones are written by the backend. */
export const NOTIFICATION_TEXT = {
  channelName: 'Reservas',
  channelDescription: 'Tu reserva: confirmación, vencimiento, cancelación y check-in.',
  reminderTitle: 'Tu reserva vence pronto',
  /** «Te queda 1 minuto…» · «Te quedan 5 minutos…». */
  reminderBody: (restaurant: string, minutes: number) =>
    `${minutes === 1 ? 'Te queda 1 minuto' : `Te quedan ${minutes} minutos`} para llegar a ${restaurant}. Si ya no vas, cancélala para liberar la mesa.`,
  // Perfil row.
  rowTitle: 'Notificaciones',
  rowOn: 'Te avisamos cuando tu reserva cambie o esté por vencer.',
  rowOff: 'Actívalas para saber cuándo tu reserva está por vencer.',
  rowBlocked: 'Están bloqueadas. Actívalas en los ajustes del teléfono.',
  activate: 'Activar',
  openSettings: 'Abrir ajustes',
} as const;
