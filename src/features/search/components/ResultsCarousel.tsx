import { useImperativeHandle, useRef, type Ref } from 'react';
import { FlatList, useWindowDimensions, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import type { RestaurantSummary } from '../types';

import { RestaurantCard } from './RestaurantCard';

/** The next card peeks on the right so the diner knows the row scrolls. */
const PEEK = 48;
const GAP = 12;

export interface ResultsCarouselHandle {
  /** Moves the row to a restaurant (its pin was tapped). */
  scrollTo: (restaurantId: string) => void;
}

interface ResultsCarouselProps {
  ref?: Ref<ResultsCarouselHandle>;
  restaurants: RestaurantSummary[];
  selectedId: string | null;
  /** The diner swiped to this card. */
  onSelect: (restaurant: RestaurantSummary) => void;
  onOpen: (restaurant: RestaurantSummary) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

/** Cards floating over the map, one per pin; the centered card is the selected restaurant. */
export function ResultsCarousel({ ref, restaurants, selectedId, onSelect, onOpen, onLayout }: ResultsCarouselProps) {
  const { width } = useWindowDimensions();
  const list = useRef<FlatList<RestaurantSummary>>(null);
  const itemWidth = width - PEEK;
  const interval = itemWidth + GAP;
  const selectedIndex = Math.max(0, restaurants.findIndex((restaurant) => restaurant.id === selectedId));

  useImperativeHandle(ref, () => ({
    scrollTo: (restaurantId) => {
      const index = restaurants.findIndex((restaurant) => restaurant.id === restaurantId);
      if (index >= 0) list.current?.scrollToOffset({ offset: index * interval, animated: true });
    },
  }));

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / interval);
    const restaurant = restaurants[Math.min(Math.max(index, 0), restaurants.length - 1)];
    if (restaurant && restaurant.id !== selectedId) onSelect(restaurant);
  };

  return (
    <View className="absolute bottom-0 left-0 right-0" onLayout={onLayout}>
      <FlatList
        ref={list}
        horizontal
        data={restaurants}
        keyExtractor={(restaurant) => restaurant.id}
        renderItem={({ item }) => (
          <View style={{ width: itemWidth }}>
            <RestaurantCard restaurant={item} floating selected={item.id === selectedId} onPress={() => onOpen(item)} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        getItemLayout={(_, index) => ({ length: interval, offset: interval * index, index })}
        initialScrollIndex={selectedIndex}
        snapToInterval={interval}
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        // A slow drag may end without momentum on Android, so the card is also read when the finger lifts.
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
        contentContainerClassName="px-4 pb-4 pt-2"
      />
    </View>
  );
}
