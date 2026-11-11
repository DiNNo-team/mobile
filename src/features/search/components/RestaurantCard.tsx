import { ArrowRight } from 'lucide-react-native';
import { View } from 'react-native';

import { AvailabilityLabel, Button, getAvailabilityPresentation, PageDots, Skeleton, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDistance, splitDistance } from '@/lib/format/distance';
import { useTheme } from '@/theme/ThemeProvider';

import { ADDRESS_FALLBACK, getCategoryLabel, type RestaurantSummary } from '../types';

interface RestaurantCardProps {
  restaurant: RestaurantSummary;
  onPress: () => void;
  /** Where the card is in the row over the map (dashes at the top right). Omit in the list. */
  position?: { index: number; count: number };
  className?: string;
}

/**
 * One search result as the mobile v3 editorial card: availability in the line, the name big, the distance as a figure
 * («a 50 m»), category, address and «Ver restaurante →». Never a number of tables.
 */
export function RestaurantCard({ restaurant, onPress, position, className }: RestaurantCardProps) {
  const { colors } = useTheme();
  const category = getCategoryLabel(restaurant.category);
  const distance = splitDistance(restaurant.distanceKm);
  const address = restaurant.address ?? ADDRESS_FALLBACK;
  const availability = getAvailabilityPresentation(restaurant.availability).label;

  return (
    <View
      className={cn('rounded-panel bg-surface px-5 pb-5 pt-[18px]', className)}
      style={{ boxShadow: colors.shadowCard }}
      accessibilityLabel={[restaurant.name, availability, category, formatDistance(restaurant.distanceKm), address].filter(Boolean).join(', ')}
    >
      <View className="flex-row items-center justify-between">
        <AvailabilityLabel availability={restaurant.availability} />
        {position ? <PageDots index={position.index} count={position.count} itemLabel="Restaurante" /> : null}
      </View>

      <View className="mt-3 flex-row items-end justify-between gap-3">
        <Text variant="title" accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} className="min-w-0 flex-1">
          {restaurant.name}
        </Text>
        <View className="flex-row items-baseline gap-1 pb-[3px]" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text variant="lead" tone="secondary">
            a
          </Text>
          <Text variant="distance">{distance.value}</Text>
          <Text variant="lead" tone="secondary">
            {distance.unit}
          </Text>
        </View>
      </View>

      {category ? (
        <Text variant="strong" className="mt-2">
          {category}
        </Text>
      ) : null}
      <Text variant="sec" tone="secondary" numberOfLines={1} className={category ? undefined : 'mt-2'}>
        {address}
      </Text>

      <Button
        variant="tinted"
        shape="pill"
        size="field"
        label="Ver restaurante"
        trailingIcon={ArrowRight}
        fullWidth
        accessibilityHint="Abre el detalle del restaurante"
        onPress={onPress}
        className="mt-4"
      />
    </View>
  );
}

const SKELETON_CARDS = 3;

/** Loading list with the cards' real shape (manual 11.5). */
export function RestaurantListSkeleton() {
  return (
    <View accessibilityLabel="Cargando restaurantes" className="gap-3">
      {Array.from({ length: SKELETON_CARDS }, (_, index) => (
        <Skeleton key={index} className="h-56 rounded-panel" />
      ))}
    </View>
  );
}
