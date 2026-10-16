import { View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { getBogotaDayOfWeek, getWeekSchedule } from '../schedule';
import type { Schedule } from '../types';

/** Week hours, Monday first, with "(día siguiente)" when a day closes after midnight; today in bold. */
export function WeekSchedule({ schedules }: { schedules: Schedule[] }) {
  const today = getBogotaDayOfWeek();
  return (
    <View className="gap-2">
      {getWeekSchedule(schedules).map((day) => {
        const isToday = day.dayOfWeek === today;
        const hours = day.closesNextDay ? `${day.hours} (día siguiente)` : day.hours;
        return (
          <View
            key={day.dayOfWeek}
            accessible
            accessibilityLabel={`${isToday ? 'Hoy, ' : ''}${day.day}: ${hours}`}
            className={cn('flex-row items-start justify-between gap-4 rounded-input px-3 py-2', isToday && 'bg-surface-2')}
          >
            <Text variant={isToday ? 'fieldLabel' : 'sec'} tone={isToday ? 'default' : 'secondary'}>
              {isToday ? `Hoy · ${day.day}` : day.day}
            </Text>
            <View className="flex-1 items-end">
              <Text variant={isToday ? 'fieldLabel' : 'sec'} tone={day.closed && !isToday ? 'secondary' : 'default'} className="text-right">
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
