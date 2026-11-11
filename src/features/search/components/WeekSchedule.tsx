import { View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { getBogotaDayOfWeek, getWeekSchedule } from '../schedule';
import type { Schedule } from '../types';

/**
 * Week hours, Monday first (mobile v3): the day in the secondary color and the hours in ink; today stands out on an
 * Arena row in 800. «(día siguiente)» when a day closes after midnight.
 */
export function WeekSchedule({ schedules }: { schedules: Schedule[] }) {
  const today = getBogotaDayOfWeek();
  return (
    <View className="gap-0.5">
      {getWeekSchedule(schedules).map((day) => {
        const isToday = day.dayOfWeek === today;
        const hours = day.closesNextDay ? `${day.hours} (día siguiente)` : day.hours;
        return (
          <View
            key={day.dayOfWeek}
            accessible
            accessibilityLabel={`${isToday ? 'Hoy, ' : ''}${day.day}: ${hours}`}
            className={cn(
              'flex-row items-center justify-between gap-4',
              isToday ? '-mx-3 min-h-[42px] rounded-[14px] bg-sand px-3' : 'min-h-9',
            )}
          >
            <Text variant={isToday ? 'heavy' : 'sec'} tone={isToday ? 'default' : 'secondary'}>
              {isToday ? `Hoy · ${day.day}` : day.day}
            </Text>
            <View className="flex-1 items-end">
              <Text variant={isToday ? 'heavy' : 'sec'} tone={day.closed && !isToday ? 'secondary' : 'default'} className="text-right">
                {day.hours}
              </Text>
              {day.closesNextDay ? (
                <Text variant="sec" tone="secondary" className="text-right">
                  (día siguiente)
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
