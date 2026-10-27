import { MapIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { AvailabilityChip, Card, getAvailabilityPresentation, Icon, Skeleton, Text } from '@/components/ui';
import { formatDistance } from '@/lib/format/distance';

import { ADDRESS_FALLBACK, getCategoryLabel, type RestaurantSummary } from '../types';

interface RestaurantCardProps {
  restaurant: RestaurantSummary;
  onPress: () => void;
  /** Highlighted from the map. */
  selected?: boolean;
  /** Card floating over the map (carousel). */
  floating?: boolean;
  className?: string;
}

/** One search result: name, availability (color + shape + word), category, distance and address. Never a number of tables. */
export function RestaurantCard({ restaurant, onPress, selected = false, floating = false, className }: RestaurantCardProps) {
  const category = getCategoryLabel(restaurant.category);
  const distance = formatDistance(restaurant.distanceKm);
  const address = restaurant.address ?? ADDRESS_FALLBACK;
  const meta = [category, distance].filter(Boolean).join(' · ');
  const availability = getAvailabilityPresentation(restaurant.availability).label;

  return (
    <Card
      onPress={onPress}
      selected={selected}
      elevation={floating ? 'floating' : 'resting'}
      className={className}
      accessibilityLabel={[restaurant.name, availability, meta, address].join(', ')}
      accessibilityHint="Abre el detalle del restaurante"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text variant="h3" numberOfLines={2} className="flex-1">
          {restaurant.name}
        </Text>
        <AvailabilityChip availability={restaurant.availability} className="mt-0.5" />
      </View>
      <Text variant="sec" tone="secondary" className="mt-1">
        {meta}
      </Text>
      <View className="mt-2 flex-row items-center gap-1.5">
        <Icon icon={MapIcon} size={16} color="text2" />
        <Text variant="sec" tone="secondary" numberOfLines={1} className="flex-1">
          {address}
        </Text>
      </View>
    </Card>
  );
}

const SKELETON_CARDS = 4;

/** Loading list with the cards' real shape (manual 11.5). */
export function RestaurantListSkeleton() {
  return (
    <View accessibilityLabel="Cargando restaurantes" className="gap-3">
      {Array.from({ length: SKELETON_CARDS }, (_, index) => (
        <Skeleton key={index} className="h-28 rounded-card" />
      ))}
    </View>
  );
}
