import { SlidersHorizontal } from 'lucide-react-native';
import { ScrollView } from 'react-native';

import { Button, FilterChip } from '@/components/ui';

import { getActiveFilters, type FilterKey } from '../filters';
import type { SearchFilters } from '../types';

interface ActiveFiltersProps {
  filters: SearchFilters;
  onOpen: () => void;
  onRemove: (key: FilterKey) => void;
  onClear: () => void;
}

/** "Filtros" + one chip with "x" per active filter + "Limpiar filtros" (Reparto, PBI 4.1). */
export function ActiveFilters({ filters, onOpen, onRemove, onClear }: ActiveFiltersProps) {
  const active = getActiveFilters(filters);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="items-center gap-2 px-4">
      <FilterChip
        icon={SlidersHorizontal}
        label={active.length > 0 ? `Filtros · ${active.length}` : 'Filtros'}
        selected={active.length > 0}
        onPress={onOpen}
      />
      {active.map((filter) => (
        <FilterChip key={filter.key} label={filter.label} onRemove={() => onRemove(filter.key)} />
      ))}
      {active.length > 0 ? <Button variant="ghost" size="sm" label="Limpiar filtros" onPress={onClear} /> : null}
    </ScrollView>
  );
}
