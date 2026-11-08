// Same rules as the web (`frontend/src/lib/format.ts`) and the backend (`tables/table-identifier.ts`): the restaurant
// may store "4", "04" or "Mesa 4" and the diner always reads "Mesa 04".

const NUMERIC = /^\d+$/;
const TABLE_WORD = /^mesa\s+/i;

/** `'4'`, `'04'`, `'Mesa 4'` → `'Mesa 04'` · `'123'` → `'Mesa 123'` · `'T1'` → `'Mesa T1'` · `'Mesa'` → `'Mesa'`. */
export function formatTableName(identifier: string): string {
  const trimmed = identifier.trim();
  const core = trimmed.replace(TABLE_WORD, '').trim() || trimmed;
  if (core.toLowerCase() === 'mesa') return 'Mesa';
  if (NUMERIC.test(core)) return `Mesa ${String(Number(core)).padStart(2, '0')}`;
  return `Mesa ${core}`;
}

/** «1 persona» · «4 personas» (glossary: capacidad in people, never pax). */
export function formatPeople(people: number): string {
  return `${people} ${people === 1 ? 'persona' : 'personas'}`;
}
