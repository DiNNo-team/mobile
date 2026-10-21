import { formatAppVersion, getDisplayName } from './profile-display';

describe('getDisplayName', () => {
  it('uses the displayName of GET /me', () => {
    expect(getDisplayName({ displayName: 'Ana María', email: 'ana@correo.com' })).toBe('Ana María');
  });

  it('trims the spaces around the name', () => {
    expect(getDisplayName({ displayName: '  Ana  ', email: 'ana@correo.com' })).toBe('Ana');
  });

  it('without a name uses the part of the email before @', () => {
    expect(getDisplayName({ displayName: null, email: 'laura.gomez@correo.com' })).toBe('laura.gomez');
  });

  it('a name made only of spaces counts as missing', () => {
    expect(getDisplayName({ displayName: '   ', email: 'laura@correo.com' })).toBe('laura');
  });
});

describe('formatAppVersion', () => {
  it('shows the version of the build', () => {
    expect(formatAppVersion('1.0.0')).toBe('Versión 1.0.0');
  });

  it('hides the line when the build has no version', () => {
    expect(formatAppVersion(undefined)).toBeNull();
    expect(formatAppVersion(null)).toBeNull();
    expect(formatAppVersion(' ')).toBeNull();
  });
});
