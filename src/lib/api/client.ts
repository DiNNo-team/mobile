import { env } from '@/config/env';

import { ApiError, toApiError } from './errors';

/** Render's free plan can take ~50 s to wake up, so the limit is above that. */
export const REQUEST_TIMEOUT_MS = 60_000;

type TokenProvider = () => Promise<string | null>;
type ApiErrorListener = (error: ApiError) => void;

let tokenProvider: TokenProvider | null = null;
const errorListeners = new Set<ApiErrorListener>();

/** The session feature plugs Firebase's `getIdToken()` here; every request then sends `Authorization: Bearer`. */
export function setAuthTokenProvider(provider: TokenProvider | null): void {
  tokenProvider = provider;
}

/** Called with every 401 and 403 answer, so the session feature can react (expired session, wrong account). */
export function subscribeToApiErrors(listener: ApiErrorListener): () => void {
  errorListeners.add(listener);
  return () => errorListeners.delete(listener);
}

export type QueryParams = Record<string, string | number | undefined>;

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/** `/search/zones` → `<origin>/v1/search/zones?…`, skipping undefined params. */
export function buildUrl(path: string, query?: QueryParams): string {
  const params = Object.entries(query ?? {})
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return `${env.apiUrl}/v1${path}${params.length ? `?${params.join('&')}` : ''}`;
}

async function buildHeaders(hasBody: boolean): Promise<Record<string, string>> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (hasBody) headers['Content-Type'] = 'application/json';
  const token = tokenProvider ? await tokenProvider() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  else if (env.devUserId) headers['x-dev-user-id'] = env.devUserId;
  return headers;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    // Empty or non-JSON body (e.g. an HTML 502 page): the status alone describes the error.
    return undefined;
  }
}

/** JSON request to the backend. Throws a normalized `ApiError`; aborts after `timeoutMs`. */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  try {
    let response: Response;
    try {
      response = await fetch(buildUrl(path, query), {
        method,
        headers: await buildHeaders(body !== undefined),
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (cause) {
      if (signal?.aborted) throw cause;
      const kind = controller.signal.aborted ? 'timeout' : 'network';
      throw new ApiError({ status: 0, kind, message: `Request failed (${kind})` });
    }

    if (!response.ok) {
      const error = toApiError(response.status, await readJson(response));
      if (error.status === 401 || error.status === 403) errorListeners.forEach((listener) => listener(error));
      throw error;
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}
