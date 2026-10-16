import { LocateFixed, MapIcon } from 'lucide-react-native';
import { Linking, View } from 'react-native';

import { Alert, Button, EmptyState } from '@/components/ui';
import { LOCATION_FAILURE_MESSAGES, type LocationFailure } from '@/features/location/location';

import type { RadiusKm } from '../types';

/** Before the system dialog (Reparto: explanation → permission): why DiNNo wants the position. */
export function LocationIntro({ onUseLocation, onChooseZone }: { onUseLocation: () => void; onChooseZone: () => void }) {
  return (
    <EmptyState
      title="Encuentra mesa cerca de ti"
      description="Usamos tu ubicación solo para mostrarte restaurantes con mesa a tu alrededor. Si prefieres, elige una zona de Bogotá."
      action={<Button icon={LocateFixed} label="Usar mi ubicación" onPress={onUseLocation} />}
      secondaryActions={<Button variant="ghost" label="Elegir una zona" onPress={onChooseZone} />}
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
        description="Escoge una zona de Bogotá para ver los restaurantes con mesa cerca de ella."
        action={<Button icon={MapIcon} label="Elegir zona" onPress={onChooseZone} />}
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
  onChangeZone: () => void;
}

/** Search without results (Reparto: "Ampliar a X km" + "Cambiar zona"; "Cambiar filtros" arrives with the filters). */
export function NoResults({ place, radiusKm, nextRadiusKm, onWiden, onChangeZone }: NoResultsProps) {
  const changeZone = <Button variant={nextRadiusKm ? 'ghost' : 'primary'} icon={MapIcon} label="Cambiar zona" onPress={onChangeZone} />;
  return (
    <EmptyState
      title="No encontramos restaurantes con mesa"
      description={`No hay restaurantes abiertos a ${radiusKm} km ${place} en este momento.`}
      action={nextRadiusKm ? <Button label={`Ampliar a ${nextRadiusKm} km`} onPress={() => onWiden(nextRadiusKm)} /> : changeZone}
      secondaryActions={nextRadiusKm ? changeZone : undefined}
    />
  );
}
