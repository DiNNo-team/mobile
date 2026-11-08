import { ApiError } from '@/lib/api/errors';

import { bannerText, completedText, createErrorView, spokenCode } from './messages';

const http = (status: number, errorCode?: string) => new ApiError({ status, kind: 'http', errorCode, message: 'texto del backend' });

describe('createErrorView (CLAUDE.md §12.9)', () => {
  it('maps each errorCode to its exact text', () => {
    expect(createErrorView(http(409, 'NO_TABLE_AVAILABLE')).message).toBe('Alguien acaba de tomar la última mesa. Prueba con otro restaurante.');
    expect(createErrorView(http(409, 'ACTIVE_RESERVATION_EXISTS'))).toEqual({
      message: 'Ya tienes una reserva activa',
      showMine: true,
      final: true,
    });
    expect(createErrorView(http(409, 'RESTAURANT_CLOSED')).message).toBe('Este restaurante acaba de cerrar.');
    expect(createErrorView(http(404, 'RESTAURANT_NOT_FOUND')).message).toBe('Este restaurante ya no está disponible.');
    expect(createErrorView(http(400)).message).toBe('Elige entre 1 y 20 personas.');
  });

  it('never shows the backend message; network and session use the generic texts', () => {
    expect(createErrorView(new ApiError({ status: 0, kind: 'network' })).message).toBe(
      'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.',
    );
    expect(createErrorView(http(401)).message).toBe('Tu sesión terminó. Inicia sesión de nuevo.');
    expect(createErrorView(http(500)).message).not.toContain('backend');
  });
});

describe('texts', () => {
  it('completed, banner and spoken code', () => {
    expect(completedText('Casa 72')).toBe('¡Listo! Ya hiciste check-in en Casa 72.');
    expect(bannerText('12:34')).toBe('Tienes una mesa reservada · 12:34');
    expect(spokenCode('K7M4QX')).toBe('K, 7, M, 4, Q, X');
  });
});
