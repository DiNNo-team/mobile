import { formatDistance } from './distance';

describe('formatDistance', () => {
  it('shows meters rounded to 50 under 1 km', () => {
    expect(formatDistance(0.65)).toBe('a 650 m');
    expect(formatDistance(0.674)).toBe('a 650 m');
    expect(formatDistance(0.676)).toBe('a 700 m');
  });

  it('never shows less than 50 m', () => {
    expect(formatDistance(0)).toBe('a 50 m');
    expect(formatDistance(0.01)).toBe('a 50 m');
  });

  it('switches to km when the rounded meters reach 1000', () => {
    expect(formatDistance(0.974)).toBe('a 950 m');
    expect(formatDistance(0.98)).toBe('a 1,0 km');
  });

  it('shows km with one decimal and a comma from 1 km', () => {
    expect(formatDistance(1)).toBe('a 1,0 km');
    expect(formatDistance(1.42)).toBe('a 1,4 km');
    expect(formatDistance(1.45)).toBe('a 1,5 km');
    expect(formatDistance(9.96)).toBe('a 10,0 km');
  });
});
