/** `errorCode` values of CLAUDE.md §10 that the diner app reacts to. */
export const ErrorCode = {
  EmailNotVerified: 'EMAIL_NOT_VERIFIED',
  ProfileRequired: 'PROFILE_REQUIRED',
  RestaurantAccount: 'RESTAURANT_ACCOUNT',
  RestaurantNotFound: 'RESTAURANT_NOT_FOUND',
  /** GET /geocode: no result inside Bogotá. */
  AddressNotFound: 'ADDRESS_NOT_FOUND',
  /** GET /geocode: Google did not answer or the daily quota ran out. */
  GeocodingUnavailable: 'GEOCODING_UNAVAILABLE',
} as const;

export type ApiErrorKind = 'http' | 'network' | 'timeout';

/**
 * Normalized backend error: `{ status, errorCode, message }` like the web. The UI never shows
 * `message` (it is the backend's text); it picks a manual text from `status` / `errorCode`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errorCode?: string;
  readonly kind: ApiErrorKind;

  constructor(init: { status: number; kind: ApiErrorKind; errorCode?: string; message?: string }) {
    super(init.message ?? `API error ${init.status}${init.errorCode ? ` (${init.errorCode})` : ''}`);
    this.name = 'ApiError';
    this.status = init.status;
    this.kind = init.kind;
    this.errorCode = init.errorCode;
  }
}

/** Error body of the backend: `{ statusCode, message, error, errorCode? }`. */
interface ErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  errorCode?: string;
}

function isErrorBody(value: unknown): value is ErrorBody {
  return typeof value === 'object' && value !== null;
}

/** Builds the ApiError of a non-2xx response; the body may be missing or not JSON (proxy pages). */
export function toApiError(status: number, body: unknown): ApiError {
  if (!isErrorBody(body)) return new ApiError({ status, kind: 'http' });
  const message = Array.isArray(body.message) ? body.message.join('; ') : body.message;
  return new ApiError({ status, kind: 'http', errorCode: body.errorCode, message });
}

export function isApiError(error: unknown, errorCode?: string): error is ApiError {
  return error instanceof ApiError && (errorCode === undefined || error.errorCode === errorCode);
}

/** Plain 401 without errorCode: the Firebase session is missing or expired. */
export function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401 && !error.errorCode;
}

export const errorMessages = {
  network: 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.',
  timeout: 'DiNNo está tardando en responder. Intenta de nuevo en un momento.',
  server: 'Algo falló de nuestro lado. Intenta de nuevo en un momento.',
  sessionExpired: 'Tu sesión terminó. Inicia sesión de nuevo.',
  emailNotVerified: 'Verifica tu correo para continuar.',
  restaurantAccount: 'Esta es una cuenta de restaurante. Administra tu restaurante desde la web.',
  forbidden: 'No tienes acceso a esta sección.',
} as const;

/** Manual texts (14.2 and CLAUDE.md §10) for the generic cases; `fallback` for everything else. */
export function getErrorMessage(error: unknown, fallback: string = errorMessages.network): string {
  if (!(error instanceof ApiError)) return fallback;
  if (error.kind === 'network') return errorMessages.network;
  if (error.kind === 'timeout') return errorMessages.timeout;
  if (error.errorCode === ErrorCode.EmailNotVerified) return errorMessages.emailNotVerified;
  if (error.errorCode === ErrorCode.RestaurantAccount) return errorMessages.restaurantAccount;
  if (error.status === 401) return errorMessages.sessionExpired;
  if (error.status === 403) return errorMessages.forbidden;
  if (error.status >= 500) return errorMessages.server;
  return fallback;
}
