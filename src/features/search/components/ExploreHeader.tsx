import { Search, SlidersHorizontal, UserRound } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { FilterChip, Icon, SegmentedControl, Text, usePressScale } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

import type { ActiveFilter, FilterKey } from '../filters';

export type ResultsView = 'map' | 'list';

const VIEW_OPTIONS = [
  { value: 'map', label: 'Mapa' },
  { value: 'list', label: 'Lista' },
] as const satisfies readonly { value: ResultsView; label: string }[];

/** A pill that sinks to 0.97 when pressed (the search field and «Filtros»). */
function PressablePill({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  className,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const press = usePressScale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      className={className}
    >
      <Animated.View style={[press.style, style]} className="h-full flex-row items-center rounded-chip">
        {children}
      </Animated.View>
    </Pressable>
  );
}

interface ExploreHeaderProps {
  /** «Cerca de ti» or the zone's name. */
  title: string;
  /** «· 2 km», or what the app is doing («Buscando tu ubicación…»). */
  detail?: string;
  /** What the search field shows: the typed address or the zone; the placeholder when it is the phone's position. */
  place?: string;
  view: ResultsView;
  /** «Mapa · Lista» only with the Maps key and results. */
  showViewToggle: boolean;
  onChangeView: (view: ResultsView) => void;
  onSearch: () => void;
  onProfile: () => void;
  onFilters: () => void;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (key: FilterKey) => void;
}

/**
 * Explorar's typographic header (mobile v3, diseño definitivo): «Explorar» + «Mapa · Lista», the screen title big
 * («Cerca de ti · 2 km»), the search field (it opens «¿Dónde buscamos?»; Perfil lives inside it because there is no
 * bottom bar) and «Filtros». Active filters show under it as removable chips.
 */
export function ExploreHeader({
  title,
  detail,
  place,
  view,
  showViewToggle,
  onChangeView,
  onSearch,
  onProfile,
  onFilters,
  activeFilters,
  onRemoveFilter,
}: ExploreHeaderProps) {
  const { colors } = useTheme();
  const profilePress = usePressScale();
  const track = { backgroundColor: colors.searchTrack };

  return (
    <View className="gap-1.5 px-5">
      <View className="h-11 flex-row items-center justify-between">
        <Text variant="strong" tone="caption">
          Explorar
        </Text>
        {showViewToggle ? (
          <SegmentedControl
            variant="pill"
            segmentWidth={66}
            options={VIEW_OPTIONS}
            value={view}
            onChange={onChangeView}
            accessibilityLabel="Ver resultados como"
          />
        ) : null}
      </View>

      <View className="flex-row items-baseline gap-2.5">
        <Text variant="screen" accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} className="shrink">
          {title}
        </Text>
        {detail ? (
          <Text variant="lead" tone="caption" numberOfLines={1} className="shrink-0">
            {detail}
          </Text>
        ) : null}
      </View>

      <View className="mt-1.5 flex-row items-center gap-2">
        <View className="h-[50px] min-w-0 flex-1 flex-row items-center gap-1 rounded-chip pl-1 pr-1.5" style={track}>
          <PressablePill
            onPress={onSearch}
            accessibilityLabel={place ? `Buscando cerca de ${place}. Cambiar dirección o zona` : 'Buscar por dirección o zona'}
            className="h-11 min-w-0 flex-1 pl-3"
          >
            <View className="flex-row items-center gap-2.5">
              <Icon icon={Search} size={18} strokeWidth={2.1} />
              <Text variant="lead" tone={place ? 'default' : 'caption'} numberOfLines={1} className="shrink">
                {place ?? 'Dirección o zona'}
              </Text>
            </View>
          </PressablePill>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Perfil"
            onPress={onProfile}
            onPressIn={profilePress.onPressIn}
            onPressOut={profilePress.onPressOut}
            hitSlop={3}
          >
            <Animated.View
              className="h-[38px] w-[38px] items-center justify-center rounded-chip"
              style={[profilePress.style, { backgroundColor: colors.avatar, boxShadow: colors.shadowRaised }]}
            >
              <Icon icon={UserRound} size={19} strokeWidth={2} />
            </Animated.View>
          </Pressable>
        </View>
        <PressablePill
          onPress={onFilters}
          accessibilityLabel={activeFilters.length > 0 ? `Filtros, ${activeFilters.length} activos` : 'Filtros'}
          className="h-[50px]"
          style={[track, { paddingLeft: 13, paddingRight: 16 }]}
        >
          <View className="flex-row items-center gap-2">
            <Icon icon={SlidersHorizontal} size={18} strokeWidth={2} />
            <Text variant="strong">
              {activeFilters.length > 0 ? `Filtros · ${activeFilters.length}` : 'Filtros'}
            </Text>
          </View>
        </PressablePill>
      </View>

      {activeFilters.length > 0 ? (
        <View className="mt-1 flex-row flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <FilterChip key={filter.key} label={filter.label} onRemove={() => onRemoveFilter(filter.key)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
