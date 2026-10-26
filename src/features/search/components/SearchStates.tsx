import { LocateFixed, MapIcon, SlidersHorizontal } from 'lucide-react-native';
import { Linking, View } from 'react-native';

import { Alert, Button, EmptyState } from '@/components/ui';
import { LOCATION_FAILURE_MESSAGES, type LocationFailure } from '@/features/location/location';

import type { RadiusKm } from '../types';

/** Before the system dialog (Reparto: explanation → permission): why DiNNo wants the position. */
export function LocationIntro({ onUseLocation, onChooseZone }: { onUseLocation: () => void; onChooseZone: () => void }) {
  return (
    <EmptyState
      title="Encuentra mesa cerca de ti"
      description="Usamos tu ubicación solo para mostrarte restaurantes con mesa a tu alrededor. Si prefieres, busca por dirección o zona."
      action={<Button icon={LocateFixed} label="Usar mi ubicación" onPress={onUseLocation} />}
      secondaryActions={<Button variant="ghost" label="Buscar por dirección o zona" onPress={onChooseZone} />}
    />
  );
}

interface ZonePromptProps {
  failure: LocationFailure | null;
  onChooseZone: () => void;
  onUseLocation: () => void;
}

/** No origin yet (the position failed or the diner preferred zones): never a blank screen. */
export function ZonePrompt({ failure, onChooseZone, onUseLocation }: ZonePromptProps) {
  return (
    <View className="gap-2">
      {failure ? (
        <Alert
          type="warning"
          message={LOCATION_FAILURE_MESSAGES[failure]}
          action={
            failure === 'blocked' ? (
              <Button size="sm" variant="outline" label="Abrir ajustes" onPress={() => Linking.openSettings()} />
            ) : undefined
          }
        />
      ) : null}
      <EmptyState
        title="Elige dónde buscar"
        description="Escribe una dirección o escoge una zona de Bogotá para ver los restaurantes con mesa cerca."
        action={<Button icon={MapIcon} label="Buscar dirección o zona" onPress={onChooseZone} />}
        secondaryActions={<Button variant="ghost" icon={LocateFixed} label="Usar mi ubicación" onPress={onUseLocation} />}
      />
    </View>
  );
}

interface NoResultsProps {
  /** "de tu ubicación" or "de Chapinero". */
  place: string;
  radiusKm: RadiusKm;
  /** Next radius, or null at 10 km. */
  nextRadiusKm: RadiusKm | null;
  onWiden: (radiusKm: RadiusKm) => void;
  onChangeFilters: () => void;
  onChangeZone: () => void;
  /** True while the wider search runs: the button shows "Buscando…". */
  searching?: boolean;
  /** Category or people are filtering the search. */
  filtered?: boolean;
}

/**
 * Search without results (Reparto, PBI 4.2): "Ampliar a X km" (the next radius), "Cambiar filtros" and
 * "Cambiar zona". At 10 km there is nothing to widen and "Cambiar filtros" becomes the main action.
 */
export function NoResults({ place, radiusKm, nextRadiusKm, onWiden, onChangeFilters, onChangeZone, searching = false, filtered = false }: NoResultsProps) {
  const widen = nextRadiusKm ? (
    <Button label={`Ampliar a ${nextRadiusKm} km`} loading={searching} loadingLabel="Buscando…" onPress={() => onWiden(nextRadiusKm)} />
  ) : null;
  return (
    <EmptyState
      title="No encontramos restaurantes con mesa"
      description={`No hay restaurantes abiertos a ${radiusKm} km ${place}${filtered ? ' con estos filtros' : ''} en este momento.`}
      action={widen ?? <Button icon={SlidersHorizontal} label="Cambiar filtros" onPress={onChangeFilters} />}
      secondaryActions={
        <>
          {widen ? <Button variant="ghost" icon={SlidersHorizontal} label="Cambiar filtros" onPress={onChangeFilters} /> : null}
          <Button variant="ghost" icon={MapIcon} label="Cambiar zona" onPress={onChangeZone} />
        </>
      }
    />
  );
}
