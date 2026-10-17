import { LocateFixed } from 'lucide-react-native';
import { Linking, View } from 'react-native';

import { Alert, BottomSheet, Button, FilterChip, RETRY_LABEL, Skeleton, Text } from '@/components/ui';
import { LOCATION_FAILURE_MESSAGES, type LocationFailure } from '@/features/location/location';
import { getErrorMessage } from '@/lib/api/errors';

import { useZones } from '../queries';
import type { SearchOrigin } from '../types';

const SKELETON_CHIPS = 8;

interface OriginSheetProps {
  visible: boolean;
  onClose: () => void;
  origin: SearchOrigin | null;
  /** Why the position could not be used, shown on top (the app passed to zones). */
  failure: LocationFailure | null;
  onUseLocation: () => void;
  onSelectZone: (zoneId: string) => void;
}

/** "¿Dónde buscamos?": the phone's position or one zone of the closed list (GET /search/zones). */
export function OriginSheet({ visible, onClose, origin, failure, onUseLocation, onSelectZone }: OriginSheetProps) {
  const zones = useZones();

  return (
    <BottomSheet visible={visible} onClose={onClose} title="¿Dónde buscamos?">
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

      <View className="gap-3">
        <Text variant="label" tone="secondary">
          Tu ubicación
        </Text>
        <FilterChip icon={LocateFixed} label="Usar mi ubicación" selected={origin?.type === 'location'} onPress={onUseLocation} />
      </View>

      <View className="gap-3">
        <Text variant="label" tone="secondary">
          Zonas de Bogotá
        </Text>
        {zones.isPending ? (
          <View accessibilityLabel="Cargando zonas" className="flex-row flex-wrap gap-2">
            {Array.from({ length: SKELETON_CHIPS }, (_, index) => (
              <Skeleton key={index} className="h-9 w-24 rounded-chip" />
            ))}
          </View>
        ) : null}
        {zones.isError ? (
          <Alert
            type="error"
            title="No pudimos cargar las zonas"
            message={getErrorMessage(zones.error)}
            action={
              <Button
                size="sm"
                variant="outline"
                label={RETRY_LABEL}
                loading={zones.isFetching}
                loadingLabel="Cargando…"
                onPress={() => zones.refetch()}
              />
            }
          />
        ) : null}
        {zones.data ? (
          <View className="flex-row flex-wrap gap-2">
            {zones.data.map((zone) => (
              <FilterChip
                key={zone.id}
                label={zone.name}
                selected={origin?.type === 'zone' && origin.zoneId === zone.id}
                onPress={() => onSelectZone(zone.id)}
              />
            ))}
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}
