import { formatPeople, formatTableName } from './table';

describe('formatTableName (same rule as the web and the backend)', () => {
  it.each([
    ['4', 'Mesa 04'],
    ['04', 'Mesa 04'],
    ['Mesa 4', 'Mesa 04'],
    [' mesa 12 ', 'Mesa 12'],
    ['123', 'Mesa 123'],
    ['T1', 'Mesa T1'],
    ['Mesa', 'Mesa'],
  ])('%s → %s', (input, expected) => {
    expect(formatTableName(input)).toBe(expected);
  });
});

describe('formatPeople', () => {
  it('uses the singular for one', () => {
    expect(formatPeople(1)).toBe('1 persona');
    expect(formatPeople(4)).toBe('4 personas');
  });
});
