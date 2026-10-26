import { validateDisplayName, validateEmail, validateNewPassword } from './validation';

describe('sign-up validation', () => {
  it('asks for a name of 1 to 60 characters after trim', () => {
    expect(validateDisplayName('')).toBe('Escribe tu nombre.');
    expect(validateDisplayName('   ')).toBe('Escribe tu nombre.');
    expect(validateDisplayName('a'.repeat(61))).toBe('Usa máximo 60 caracteres.');
    expect(validateDisplayName('  Ana María  ')).toBeUndefined();
  });

  it('asks for a valid email', () => {
    expect(validateEmail('')).toBe('Escribe tu correo.');
    expect(validateEmail('ana@correo')).toBe('Escribe un correo válido, por ejemplo ana@correo.com.');
    expect(validateEmail(' ana@correo.com ')).toBeUndefined();
  });

  it('asks for a password of at least 8 characters', () => {
    expect(validateNewPassword('')).toBe('Escribe una contraseña.');
    expect(validateNewPassword('1234567')).toBe('Usa al menos 8 caracteres.');
    expect(validateNewPassword('12345678')).toBeUndefined();
  });
});
