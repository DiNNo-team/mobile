import { ApiError, ErrorCode, getErrorMessage } from '@/lib/api/errors';

// The single map `errorCode → text` of the app for Sprint 3 (CLAUDE.md §12.9, reparto 9.2 and the decisions of the
// sprint's Phase 0). Screens ask here; never write these strings in a component. The backend `message` is never shown.

export const RESERVATION_TEXT = {
  reserve: 'Reservar mesa',
  reserveNow: 'Reservar ahora',
  reserving: 'Reservando…',
  viewMine: 'Ver mi reserva',
  directions: 'Cómo llegar',
  cancel: 'Cancelar reserva',
  cancelTitle: '¿Cancelar tu reserva? La mesa quedará libre para otra persona.',
  cancelConfirm: 'Sí, cancelar',
  cancelKeep: 'Mantener reserva',
  cancelling: 'Cancelando…',
  verifying: 'Verificando…',
  searchAnother: 'Buscar otra mesa',
  /** H1: the TTL is not known before reserving (15 min, or 3 in the expiry demo). */
  validity: 'Te guardamos la mesa unos minutos. El tiempo exacto aparece al confirmar.',
  expired: 'Tu reserva se venció. La mesa quedó libre.',
  cancelled: 'Cancelaste tu reserva. La mesa quedó libre.',
  codeLabel: 'Tu código',
  codeHint: 'Muéstraselo al restaurante al llegar.',
  closedReason: 'Este restaurante está cerrado ahora.',
  noTablesReason: 'Ahora no tiene mesas disponibles.',
  // createErrorText.
  noTableAvailable: 'Alguien acaba de tomar la última mesa. Prueba con otro restaurante.',
  activeReservationExists: 'Ya tienes una reserva activa',
  restaurantClosed: 'Este restaurante acaba de cerrar.',
  restaurantGone: 'Este restaurante ya no está disponible.',
  invalidPartySize: 'Elige entre 1 y 20 personas.',
  createFailed: 'No pudimos reservar la mesa. Intenta de nuevo.',
  cancelFailed: 'No pudimos cancelar la reserva. Intenta de nuevo.',
  loadFailed: 'No pudimos cargar tu reserva.',
} as const;

/** «¡Listo! Ya hiciste check-in en Casa 72.» (manual 14: «¡Listo!» only in the diner app). */
export function completedText(restaurantName: string): string {
  return `¡Listo! Ya hiciste check-in en ${restaurantName}.`;
}

/** Banner of Explorar: «Tienes una mesa reservada · 12:34». */
export function bannerText(countdown: string): string {
  return `Tienes una mesa reservada · ${countdown}`;
}

/** «K, 7, M, 4, Q, X»: TalkBack reads the code one character at a time. */
export function spokenCode(code: string): string {
  return code.split('').join(', ');
}

export interface CreateErrorView {
  message: string;
  /** ACTIVE_RESERVATION_EXISTS: offer «Ver mi reserva». */
  showMine?: boolean;
  /** The restaurant cannot be reserved anymore (closed, gone): no point in retrying here. */
  final?: boolean;
}

/** What the reserve sheet shows when POST /reservations fails (§12.9). Network and session use the generic texts. */
export function createErrorView(error: unknown): CreateErrorView {
  if (error instanceof ApiError) {
    switch (error.errorCode) {
      case ErrorCode.NoTableAvailable:
        return { message: RESERVATION_TEXT.noTableAvailable, final: true };
      case ErrorCode.ActiveReservationExists:
        return { message: RESERVATION_TEXT.activeReservationExists, showMine: true, final: true };
      case ErrorCode.RestaurantClosed:
        return { message: RESERVATION_TEXT.restaurantClosed, final: true };
      case ErrorCode.RestaurantNotFound:
        return { message: RESERVATION_TEXT.restaurantGone, final: true };
    }
    if (error.kind === 'http' && error.status === 400) return { message: RESERVATION_TEXT.invalidPartySize };
  }
  return { message: getErrorMessage(error, RESERVATION_TEXT.createFailed) };
}
