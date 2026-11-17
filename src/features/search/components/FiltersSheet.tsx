import { useState, type ReactNode } from "react";
import { View } from "react-native";

import {
  BottomSheet,
  Button,
  FilterChip,
  NumberStepper,
  Text,
} from "@/components/ui";

import { formatPartySize } from "../filters";
import {
  PARTY_SIZE_LIMITS,
  RESTAURANT_CATEGORIES,
  RESTAURANT_CATEGORY_LABELS,
  type SearchFilters,
} from "../types";

/** First value of the stepper when the diner chooses a number of people. */
const DEFAULT_PARTY_SIZE = 2;

interface FiltersSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Applied filters: the sheet edits a copy and changes nothing until "Ver restaurantes". */
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text variant="label" tone="secondary">
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * Filters (Reparto, PBI 4.1): category and people (1 to 20). No distance since Sprint 4: the map shows every restaurant.
 * Mount it with a new `key` each time it opens so the copy starts from the applied filters.
 */
export function FiltersSheet({
  visible,
  onClose,
  filters,
  onApply,
}: FiltersSheetProps) {
  const [draft, setDraft] = useState<SearchFilters>(filters);
  const update = (change: Partial<SearchFilters>) =>
    setDraft((current) => ({ ...current, ...change }));

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filtros"
      footer={
        <>
          <Button
            label="Ver restaurantes"
            fullWidth
            onPress={() => onApply(draft)}
          />
          <Button
            variant="ghost"
            label="Limpiar filtros"
            fullWidth
            onPress={() => setDraft({})}
          />
        </>
      }
    >
      <Section title="Categoría">
        <View className="flex-row flex-wrap gap-2">
          <FilterChip
            label="Todas"
            selected={!draft.category}
            onPress={() => update({ category: undefined })}
          />
          {RESTAURANT_CATEGORIES.map((category) => (
            <FilterChip
              key={category}
              label={RESTAURANT_CATEGORY_LABELS[category]}
              selected={draft.category === category}
              onPress={() =>
                update({
                  category: draft.category === category ? undefined : category,
                })
              }
            />
          ))}
        </View>
      </Section>

      <Section title="Personas">
        <View className="flex-row flex-wrap gap-2">
          <FilterChip
            label="Cualquier cantidad"
            selected={!draft.partySize}
            onPress={() => update({ partySize: undefined })}
          />
          <FilterChip
            label="Elegir personas"
            selected={!!draft.partySize}
            onPress={() =>
              update({ partySize: draft.partySize ?? DEFAULT_PARTY_SIZE })
            }
          />
        </View>
        {draft.partySize ? (
          <NumberStepper
            value={draft.partySize}
            min={PARTY_SIZE_LIMITS.min}
            max={PARTY_SIZE_LIMITS.max}
            onChange={(partySize) => update({ partySize })}
            accessibilityLabel="Personas"
            formatValue={formatPartySize}
          />
        ) : null}
        <Text variant="sec" tone="secondary">
          Solo verás restaurantes con una mesa libre para ese número de
          personas.
        </Text>
      </Section>
    </BottomSheet>
  );
}
