import { Search, SlidersHorizontal, UserRound, X } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";

import {
  FilterChip,
  Icon,
  IconButton,
  SegmentedControl,
  Text,
  usePressScale,
} from "@/components/ui";
import { useTheme } from "@/theme/ThemeProvider";

import type { ActiveFilter, FilterKey } from "../filters";

export type ResultsView = "map" | "list";

const VIEW_OPTIONS = [
  { value: "map", label: "Mapa" },
  { value: "list", label: "Lista" },
] as const satisfies readonly { value: ResultsView; label: string }[];

/** A pill that sinks to 0.97 when pressed («Filtros»). */
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
      <Animated.View
        style={[press.style, style]}
        className="h-full flex-row items-center rounded-chip"
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

interface ExploreHeaderProps {
  title: string;
  /** «· 12 con mesa», or what the app is doing («Buscando…»). */
  detail?: string;
  /** What the diner typed in «Buscar restaurante». */
  query: string;
  onChangeQuery: (query: string) => void;
  view: ResultsView;
  /** «Mapa · Lista» only with the Maps key and results. */
  showViewToggle: boolean;
  onChangeView: (view: ResultsView) => void;
  onProfile: () => void;
  onFilters: () => void;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (key: FilterKey) => void;
}

/**
 * Explorar's typographic header (mobile v3, diseño definitivo): «Explorar» + «Mapa · Lista», the screen title big
 * («Restaurantes · 12 con mesa»), «Buscar restaurante» (filters by name as the diner types; Perfil lives inside it
 * because there is no bottom bar) and «Filtros». Active filters show under it as removable chips.
 */
export function ExploreHeader({
  title,
  detail,
  query,
  onChangeQuery,
  view,
  showViewToggle,
  onChangeView,
  onProfile,
  onFilters,
  activeFilters,
  onRemoveFilter,
}: ExploreHeaderProps) {
  const { colors, scheme } = useTheme();
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
        <Text
          variant="screen"
          accessibilityRole="header"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          className="shrink"
        >
          {title}
        </Text>
        {detail ? (
          <Text
            variant="lead"
            tone="caption"
            numberOfLines={1}
            className="shrink-0"
          >
            {detail}
          </Text>
        ) : null}
      </View>

      <View className="mt-1.5 flex-row items-center gap-2">
        <View
          className="h-[50px] min-w-0 flex-1 flex-row items-center gap-1 rounded-chip pl-1 pr-1.5"
          style={track}
        >
          <View className="h-11 min-w-0 flex-1 flex-row items-center gap-2.5 pl-3">
            <Icon icon={Search} size={18} strokeWidth={2.1} />
            <TextInput
              value={query}
              onChangeText={onChangeQuery}
              placeholder="Buscar restaurante"
              placeholderTextColor={colors.text2}
              accessibilityLabel="Buscar restaurante por nombre"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="never"
              keyboardAppearance={scheme}
              className="h-full min-w-0 flex-1 font-sans text-lead text-fg"
            />
            {query ? (
              <IconButton
                icon={X}
                accessibilityLabel="Borrar búsqueda"
                color="text2"
                onPress={() => onChangeQuery("")}
                className="-mx-2"
              />
            ) : null}
          </View>
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
              style={[
                profilePress.style,
                {
                  backgroundColor: colors.avatar,
                  boxShadow: colors.shadowRaised,
                },
              ]}
            >
              <Icon icon={UserRound} size={19} strokeWidth={2} />
            </Animated.View>
          </Pressable>
        </View>
        <PressablePill
          onPress={onFilters}
          accessibilityLabel={
            activeFilters.length > 0
              ? `Filtros, ${activeFilters.length} activos`
              : "Filtros"
          }
          className="h-[50px]"
          style={[track, { paddingLeft: 13, paddingRight: 16 }]}
        >
          <View className="flex-row items-center gap-2">
            <Icon icon={SlidersHorizontal} size={18} strokeWidth={2} />
            <Text variant="strong">
              {activeFilters.length > 0
                ? `Filtros · ${activeFilters.length}`
                : "Filtros"}
            </Text>
          </View>
        </PressablePill>
      </View>

      {activeFilters.length > 0 ? (
        <View className="mt-1 flex-row flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              onRemove={() => onRemoveFilter(filter.key)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
