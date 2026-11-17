import { SlidersHorizontal, X } from "lucide-react-native";

import { Button, EmptyState } from "@/components/ui";

interface NoResultsProps {
  /** What the diner typed in «Buscar restaurante», already trimmed; empty when nothing. */
  query: string;
  /** Category or people are filtering the search. */
  filtered: boolean;
  onClearQuery: () => void;
  onChangeFilters: () => void;
}

/**
 * No restaurant to show (Reparto, PBI 4.2): the name typed matches none, the filters leave none, or nothing is open
 * with tables right now. Each case says why and offers the one action that helps.
 */
export function NoResults({
  query,
  filtered,
  onClearQuery,
  onChangeFilters,
}: NoResultsProps) {
  const changeFilters = (
    <Button
      icon={SlidersHorizontal}
      label="Cambiar filtros"
      onPress={onChangeFilters}
    />
  );
  if (query) {
    return (
      <EmptyState
        title={`No encontramos «${query}»`}
        description={`Ningún restaurante con mesa ahora se llama así${filtered ? " con estos filtros" : ""}. Revisa cómo lo escribiste o borra la búsqueda.`}
        action={
          <Button icon={X} label="Borrar búsqueda" onPress={onClearQuery} />
        }
        secondaryActions={
          filtered ? (
            <Button
              variant="ghost"
              icon={SlidersHorizontal}
              label="Cambiar filtros"
              onPress={onChangeFilters}
            />
          ) : undefined
        }
      />
    );
  }
  if (filtered) {
    return (
      <EmptyState
        title="No encontramos restaurantes con mesa"
        description="No hay restaurantes abiertos con estos filtros en este momento."
        action={changeFilters}
      />
    );
  }
  return (
    <EmptyState
      title="No hay restaurantes con mesa ahora"
      description="Ningún restaurante está abierto con mesas libres en este momento. Vuelve a mirar en un rato."
    />
  );
}
