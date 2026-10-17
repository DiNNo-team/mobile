import { ArrowRight, Map, Search, Tag, Users } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Alert,
  AvailabilityChip,
  AvailabilityMarker,
  BottomSheet,
  BrandSymbol,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  FilterChip,
  FloatingSurface,
  IconButton,
  Logo,
  NumberStepper,
  OpenStatusChip,
  ScreenHeader,
  SegmentedControl,
  Skeleton,
  Spinner,
  Text,
  TextField,
  UserLocationMarker,
  useToast,
  type ButtonVariant,
} from '@/components/ui';
import { RADIUS_OPTIONS_KM, type Availability, type RadiusKm } from '@/features/search/types';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';

const AVAILABILITIES: Availability[] = ['available', 'few', 'none', 'closed'];
const BUTTON_VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
] as const satisfies readonly { value: ThemePreference; label: string }[];
const CATEGORIES = ['Colombiana', 'Italiana', 'Cafetería'];

const people = (n: number) => (n === 1 ? '1 persona' : `${n} personas`);

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

/** Catalog of the mobile kit with every state, light and dark (route /kit, development builds only). */
export function KitScreen() {
  const insets = useSafeAreaInsets();
  const { preference, setPreference } = useTheme();
  const { showToast } = useToast();
  const [radius, setRadius] = useState<RadiusKm>(2);
  const [partySize, setPartySize] = useState(2);
  const [category, setCategory] = useState<string | null>('Italiana');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<Availability>('available');

  const confirmDialog = () => {
    setDialogBusy(true);
    setTimeout(() => {
      setDialogBusy(false);
      setDialogOpen(false);
      showToast({ type: 'success', message: 'Sesión cerrada' });
    }, 1200);
  };

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="gap-8 px-4 pb-16"
      contentContainerStyle={{ paddingTop: insets.top + 16 }}
    >
      <ScreenHeader title="Kit móvil" subtitle="Componentes de src/components/ui con todos sus estados" showBack />

      <Section title="Tema">
        <SegmentedControl options={THEME_OPTIONS} value={preference} onChange={setPreference} accessibilityLabel="Tema" />
      </Section>

      <Section title="Marca">
        <View className="flex-row items-end gap-6">
          <Logo width={144} />
          <BrandSymbol height={48} />
          <BrandSymbol height={48} variant="outline" />
        </View>
      </Section>

      <Section title="Tipografía">
        <Text variant="display">Display</Text>
        <Text variant="h1">Título 1</Text>
        <Text variant="h2">Título 2</Text>
        <Text variant="h3">Título 3</Text>
        <Text variant="body">Cuerpo: encuentra una mesa disponible ahora.</Text>
        <Text variant="sec" tone="secondary">
          Secundario: metadatos y ayudas.
        </Text>
        <Text variant="label" tone="secondary">
          Etiqueta
        </Text>
        <Text variant="figure">12:45</Text>
        <Text variant="body" tone="accent">
          Texto naranja sobre claro (naranja profundo)
        </Text>
      </Section>

      <Section title="Botones · pulsa para ver el estado presionado">
        {BUTTON_VARIANTS.map((variant) => (
          <View key={variant} className="flex-row flex-wrap gap-2">
            <Button variant={variant} label={variant === 'primary' ? 'Ver restaurantes' : 'Cómo llegar'} />
            <Button variant={variant} label="Deshabilitado" disabled />
            <Button variant={variant} label="Guardar" loading loadingLabel="Guardando…" />
          </View>
        ))}
        <View className="flex-row flex-wrap gap-2">
          <Button variant="secondary" size="float" label="Flotante 44" icon={Map} />
          <Button variant="outline" size="sm" label="Pequeño 40" icon={ArrowRight} />
        </View>
        <Button label="A lo ancho" fullWidth icon={Search} />
        <View className="flex-row gap-2">
          <IconButton icon={Search} accessibilityLabel="Buscar" />
          <IconButton icon={Map} accessibilityLabel="Ver mapa" background="surface" />
          <IconButton icon={Tag} accessibilityLabel="Categoría" disabled />
        </View>
        <View className="flex-row items-center gap-3">
          <Spinner />
          <Spinner size={20} color="accentText" />
        </View>
      </Section>

      <Section title="Campos">
        <TextField label="Correo" placeholder="Ej.: ana@correo.com" keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Nombre" optional helperText="Así te verán los restaurantes." />
        <TextField label="Contraseña" password helperText="Mínimo 8 caracteres." />
        <TextField label="Correo" defaultValue="ana@" errorText="Escribe un correo válido, por ejemplo ana@correo.com." />
        <TextField label="Zona" defaultValue="Chapinero" disabled />
      </Section>

      <Section title="Disponibilidad (color + forma + palabra)">
        <View className="flex-row flex-wrap gap-2">
          {AVAILABILITIES.map((availability) => (
            <AvailabilityChip key={availability} availability={availability} />
          ))}
        </View>
        <View className="flex-row gap-2">
          <OpenStatusChip isOpen />
          <OpenStatusChip isOpen={false} />
        </View>
        <Text variant="sec" tone="secondary">
          Pines del mapa (toca uno para seleccionarlo) y tu ubicación:
        </Text>
        <View className="flex-row items-center gap-4 rounded-card bg-surface-2 p-4">
          {AVAILABILITIES.map((availability) => (
            <IconButtonLike key={availability} onPress={() => setSelectedMarker(availability)}>
              <AvailabilityMarker availability={availability} selected={selectedMarker === availability} />
            </IconButtonLike>
          ))}
          <UserLocationMarker />
        </View>
      </Section>

      <Section title="Tarjetas">
        <Card>
          <Text variant="h3">Casa 72</Text>
          <Text variant="sec" tone="secondary">
            Colombiana · a 650 m
          </Text>
          <AvailabilityChip availability="available" className="mt-2" />
        </Card>
        <Card onPress={() => showToast({ type: 'info', message: 'Tocaste la tarjeta' })}>
          <Text variant="h3">Tarjeta que se puede tocar</Text>
          <Text variant="sec" tone="secondary">
            Al presionar cambia de fondo.
          </Text>
        </Card>
        <Card selected onPress={() => undefined}>
          <Text variant="h3">Seleccionada</Text>
          <Text variant="sec" tone="secondary">
            Borde naranja: es la del pin elegido en el mapa.
          </Text>
        </Card>
      </Section>

      <Section title="Filtros">
        <View className="flex-row flex-wrap gap-2">
          {CATEGORIES.map((name) => (
            <FilterChip
              key={name}
              label={name}
              selected={category === name}
              onPress={() => setCategory(category === name ? null : name)}
            />
          ))}
        </View>
        <View className="flex-row flex-wrap gap-2">
          <FilterChip label={`${radius} km`} icon={Map} onRemove={() => setRadius(2)} />
          <FilterChip label={people(partySize)} icon={Users} onRemove={() => setPartySize(2)} />
        </View>
        <SegmentedControl
          options={RADIUS_OPTIONS_KM.map((km) => ({ value: km, label: `${km} km` }))}
          value={radius}
          onChange={setRadius}
          accessibilityLabel="Distancia"
        />
        <NumberStepper value={partySize} min={1} max={20} onChange={setPartySize} accessibilityLabel="Personas" formatValue={people} />
      </Section>

      <Section title="Avisos">
        <Alert type="success" message="Cambios guardados." />
        <Alert type="info" title="Usando una zona" message="No pudimos obtener tu ubicación. Te mostramos restaurantes en Chapinero." />
        <Alert type="warning" message="Conectando con DiNNo…" />
        <Alert
          type="error"
          message="No pudimos conectarnos. Revisa tu conexión e intenta de nuevo."
          action={<Button size="sm" variant="outline" label="Intentar de nuevo" />}
        />
        <View className="flex-row flex-wrap gap-2">
          <Button size="sm" variant="outline" label="Toast de éxito" onPress={() => showToast({ type: 'success', message: 'Filtros aplicados' })} />
          <Button
            size="sm"
            variant="outline"
            label="Toast con acción"
            onPress={() =>
              showToast({ type: 'info', message: 'Filtros limpiados', actionLabel: 'Deshacer', onAction: () => setCategory('Italiana') })
            }
          />
          <Button size="sm" variant="outline" label="Toast de error" onPress={() => showToast({ type: 'error', message: 'No pudimos actualizar la disponibilidad.' })} />
        </View>
      </Section>

      <Section title="Diálogo y hoja inferior">
        <View className="flex-row flex-wrap gap-2">
          <Button variant="outline" label="Abrir diálogo" onPress={() => setDialogOpen(true)} />
          <Button variant="outline" label="Abrir filtros" onPress={() => setSheetOpen(true)} />
        </View>
      </Section>

      <Section title="Vacío, error y carga">
        <Card>
          <EmptyState
            title="No hay restaurantes con mesa cerca"
            description="Prueba con una distancia mayor o cambia los filtros."
            action={<Button label="Ampliar a 5 km" />}
            secondaryActions={<Button variant="ghost" label="Cambiar filtros" />}
          />
        </Card>
        <Card>
          <ErrorState
            title="No pudimos cargar los restaurantes"
            description="Revisa tu conexión e intenta de nuevo."
            onRetry={() => showToast({ type: 'info', message: 'Reintentando…' })}
          />
        </Card>
        <Card>
          <View className="gap-3">
            <Skeleton className="h-6 w-40 rounded-input" />
            <Skeleton className="h-4 w-24 rounded-input" />
            <Skeleton className="h-6 w-28 rounded-chip" />
          </View>
        </Card>
      </Section>

      <Section title="Flotante sobre el mapa">
        <View className="gap-3 rounded-card bg-surface-2 p-4">
          <FloatingSurface shape="chip">
            <Text variant="chip">3 filtros activos</Text>
          </FloatingSurface>
          <FloatingSurface>
            <Text variant="h3">Trattoria Quinta</Text>
            <Text variant="sec" tone="secondary">
              Italiana · a 1,2 km
            </Text>
            <AvailabilityChip availability="few" className="mt-2" />
          </FloatingSurface>
        </View>
      </Section>

      <Dialog
        visible={dialogOpen}
        onClose={() => setDialogOpen(false)}
        busy={dialogBusy}
        title="¿Cerrar sesión?"
        description="Tendrás que iniciar sesión de nuevo para buscar mesa."
        actions={
          <>
            <Button label="Cerrar sesión" fullWidth loading={dialogBusy} loadingLabel="Cerrando sesión…" onPress={confirmDialog} />
            <Button variant="outline" label="Cancelar" fullWidth disabled={dialogBusy} onPress={() => setDialogOpen(false)} />
          </>
        }
      />

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtros"
        footer={
          <>
            <Button label="Ver restaurantes" fullWidth onPress={() => setSheetOpen(false)} />
            <Button variant="ghost" label="Limpiar filtros" fullWidth onPress={() => setCategory(null)} />
          </>
        }
      >
        <Section title="Categoría">
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((name) => (
              <FilterChip key={name} label={name} selected={category === name} onPress={() => setCategory(name)} />
            ))}
          </View>
        </Section>
        <Section title="Distancia">
          <SegmentedControl
            options={RADIUS_OPTIONS_KM.map((km) => ({ value: km, label: `${km} km` }))}
            value={radius}
            onChange={setRadius}
            accessibilityLabel="Distancia"
          />
        </Section>
        <Section title="Personas">
          <NumberStepper value={partySize} min={1} max={20} onChange={setPartySize} accessibilityLabel="Personas" formatValue={people} />
        </Section>
      </BottomSheet>
    </ScrollView>
  );
}

/** Makes a marker tappable inside the catalog (on the map the marker itself is tappable). */
function IconButtonLike({ children, onPress }: { children: ReactNode; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="min-h-11 min-w-11 items-center justify-center">
      {children}
    </Pressable>
  );
}
