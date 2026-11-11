import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { FlatList, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import type { RestaurantSummary } from '../types';

import { RestaurantCard } from './RestaurantCard';

/** The card sits 10 from the frame's edges (mobile v3) and the next one waits 10 further right. */
const INSET = 10;

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

/** The editorial card at the bottom of the map frame, one per pin; swiping changes the selected restaurant. */
export function ResultsCarousel({ ref, restaurants, selectedId, onSelect, onOpen, onLayout }: ResultsCarouselProps) {
  const [width, setWidth] = useState(0);
  const list = useRef<FlatList<RestaurantSummary>>(null);
  const itemWidth = Math.max(0, width - INSET * 2);
  const interval = itemWidth + INSET;
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
    <View
      className="absolute bottom-0 left-0 right-0"
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
        onLayout?.(event);
      }}
    >
      {width > 0 ? (
        <FlatList
          ref={list}
          horizontal
          data={restaurants}
          keyExtractor={(restaurant) => restaurant.id}
          renderItem={({ item, index }) => (
            <View style={{ width: itemWidth }}>
              <RestaurantCard restaurant={item} position={{ index, count: restaurants.length }} onPress={() => onOpen(item)} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ width: INSET }} />}
          getItemLayout={(_, index) => ({ length: interval, offset: interval * index, index })}
          initialScrollIndex={selectedIndex}
          snapToInterval={interval}
          decelerationRate="fast"
          disableIntervalMomentum
          showsHorizontalScrollIndicator={false}
          // A slow drag may end without momentum on Android, so the card is also read when the finger lifts.
          onScrollEndDrag={onScrollEnd}
          onMomentumScrollEnd={onScrollEnd}
          contentContainerStyle={{ paddingHorizontal: INSET, paddingBottom: INSET, paddingTop: 12 }}
        />
      ) : null}
    </View>
  );
}
