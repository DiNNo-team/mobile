import { ApiError, ErrorCode, errorMessages, getErrorMessage, isApiError, isSessionExpired, toApiError } from './errors';

describe('toApiError', () => {
  it('keeps status, errorCode and message of the backend body', () => {
    const error = toApiError(403, {
      statusCode: 403,
      message: 'Esta es una cuenta de restaurante.',
      error: 'Forbidden',
      errorCode: ErrorCode.RestaurantAccount,
    });
    expect(error).toMatchObject({ status: 403, kind: 'http', errorCode: 'RESTAURANT_ACCOUNT' });
    expect(error.message).toBe('Esta es una cuenta de restaurante.');
  });

  it('joins validation messages', () => {
    expect(toApiError(400, { message: ['lat inválida', 'lng inválida'] }).message).toBe('lat inválida; lng inválida');
  });

  it('works without a JSON body', () => {
    expect(toApiError(502, undefined)).toMatchObject({ status: 502, kind: 'http', errorCode: undefined });
  });
});

describe('session and account helpers', () => {
  it('only a 401 without errorCode is an expired session', () => {
    expect(isSessionExpired(new ApiError({ status: 401, kind: 'http' }))).toBe(true);
    expect(isSessionExpired(new ApiError({ status: 401, kind: 'http', errorCode: ErrorCode.EmailNotVerified }))).toBe(false);
  });

  it('matches by errorCode', () => {
    const error = new ApiError({ status: 404, kind: 'http', errorCode: ErrorCode.RestaurantNotFound });
    expect(isApiError(error, ErrorCode.RestaurantNotFound)).toBe(true);
    expect(isApiError(error, ErrorCode.ProfileRequired)).toBe(false);
    expect(isApiError(new Error('x'))).toBe(false);
  });
});

describe('getErrorMessage', () => {
  const http = (status: number, errorCode?: string) => new ApiError({ status, kind: 'http', errorCode });

  it('maps each case to the manual text', () => {
    expect(getErrorMessage(new ApiError({ status: 0, kind: 'network' }))).toBe(errorMessages.network);
    expect(getErrorMessage(new ApiError({ status: 0, kind: 'timeout' }))).toBe(errorMessages.timeout);
    expect(getErrorMessage(http(401))).toBe(errorMessages.sessionExpired);
    expect(getErrorMessage(http(401, ErrorCode.EmailNotVerified))).toBe(errorMessages.emailNotVerified);
    expect(getErrorMessage(http(403, ErrorCode.RestaurantAccount))).toBe(errorMessages.restaurantAccount);
    expect(getErrorMessage(http(403))).toBe(errorMessages.forbidden);
    expect(getErrorMessage(http(500))).toBe(errorMessages.server);
  });

  it('uses the fallback for anything else', () => {
    expect(getErrorMessage(http(400), 'Revisa los filtros.')).toBe('Revisa los filtros.');
    expect(getErrorMessage(new Error('boom'), 'Otro texto')).toBe('Otro texto');
  });
});
