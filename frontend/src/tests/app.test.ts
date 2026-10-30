import { describe, it, expect } from 'vitest';

describe('Turnify Frontend Core', () => {
  it('validates email format utility', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValidEmail('admin@turnify.com')).toBe(true);
    expect(isValidEmail('cliente@turnify.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('validates password minimum length requirement (HU-01)', () => {
    const isValidPassword = (pass: string) => pass.length >= 6;
    expect(isValidPassword('Admin123!')).toBe(true);
    expect(isValidPassword('12345')).toBe(false);
  });

  it('validates time format HH:mm', () => {
    const isValidTime = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
    expect(isValidTime('09:00')).toBe(true);
    expect(isValidTime('18:30')).toBe(true);
    expect(isValidTime('25:00')).toBe(false);
  });
});
