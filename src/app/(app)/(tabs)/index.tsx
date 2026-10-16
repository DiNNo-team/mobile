import { useQuery } from '@tanstack/react-query';

import { PlaceholderLink, ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { SegmentedControl, Text } from '@/components/ui';
import { env } from '@/config/env';
import { searchApi } from '@/features/search/api';
import { DEFAULT_RADIUS_KM } from '@/features/search/types';
import { getErrorMessage } from '@/lib/api/errors';
import { formatDistance } from '@/lib/format/distance';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
] as const satisfies readonly { value: ThemePreference; label: string }[];

const MISSING_RESTAURANT_ID = '00000000-0000-4000-8000-000000000000';

/** Phase 1 check: theme switch, API config and a search with the examples (Calle 72). */
export default function ExploreScreen() {
  const { preference, setPreference } = useTheme();
  const search = useQuery({
    queryKey: ['phase1-check', 'calle-72'],
    queryFn: () => searchApi.searchRestaurants({ type: 'zone', zoneId: 'calle-72' }, { radiusKm: DEFAULT_RADIUS_KM }),
  });
  const first = search.data?.[0];

  return (
    <ScreenPlaceholder
      title="Explorar"
      description="Aquí van la búsqueda, la lista y el mapa de restaurantes."
      owner="Sebastián · fases 4 y 5"
    >
      <Text variant="label" tone="secondary">
        Tema
      </Text>
      <SegmentedControl options={THEME_OPTIONS} value={preference} onChange={setPreference} accessibilityLabel="Tema" />

      <Text variant="label" tone="secondary" className="mt-4">
        Conexión
      </Text>
      <Text variant="sec">API: {env.apiUrl}/v1</Text>
      <Text variant="sec">Datos de ejemplo: {env.useMocks ? 'sí' : 'no'}</Text>
      <Text variant="sec">
        {search.isPending && 'Buscando en Calle 72…'}
        {search.isError && getErrorMessage(search.error)}
        {search.isSuccess && `${search.data.length} restaurantes en Calle 72 a ${DEFAULT_RADIUS_KM} km`}
      </Text>
      {first ? (
        <Text variant="sec" tone="secondary">
          El más cercano: {first.name}, {formatDistance(first.distanceKm)}
        </Text>
      ) : null}

      <Text variant="label" tone="secondary" className="mt-4">
        Rutas
      </Text>
      {__DEV__ ? <PlaceholderLink href="/kit" label="Ver el kit móvil" /> : null}
      <PlaceholderLink href="/login" label="Ir a iniciar sesión" />
      <PlaceholderLink href="/crear-cuenta" label="Ir a crear cuenta" />
      <PlaceholderLink href="/verificar-correo" label="Ir a verificar correo" />
      <PlaceholderLink href="/cuenta-restaurante" label="Ir a cuenta de restaurante" />
      {first ? <PlaceholderLink href={`/restaurante/${first.id}`} label={`Ver detalle de ${first.name}`} /> : null}
      <PlaceholderLink href={`/restaurante/${MISSING_RESTAURANT_ID}`} label="Ver un restaurante que no existe" />
    </ScreenPlaceholder>
  );
}
