/** Joins class names, skipping empty values: `cn('px-4', isActive && 'border-accent')`. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
