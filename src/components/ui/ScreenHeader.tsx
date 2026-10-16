import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { IconButton } from './IconButton';
import { Text } from './Text';

export interface ScreenHeaderProps {
  title: string;
  /** One secondary line under the title. */
  subtitle?: string;
  /** Shows the back button (arrow-left). Calls `onBack`, or goes back in the stack. */
  showBack?: boolean;
  onBack?: () => void;
  /** Actions on the right (IconButtons or one small Button). */
  actions?: ReactNode;
  /** `h1` for tab screens, `h2` for pushed screens (detail). */
  size?: 'h1' | 'h2';
  className?: string;
}

/** Header of a mobile screen: optional back, title + subtitle, actions on the right (manual 9, PageHeader). */
export function ScreenHeader({ title, subtitle, showBack = false, onBack, actions, size = 'h1', className }: ScreenHeaderProps) {
  return (
    <View className={cn('gap-2', className)}>
      {showBack || actions ? (
        <View className="flex-row items-center justify-between">
          {showBack ? (
            <IconButton icon={ArrowLeft} accessibilityLabel="Volver" onPress={onBack ?? (() => router.back())} className="-ml-3" />
          ) : (
            <View />
          )}
          {actions ? <View className="flex-row items-center gap-1">{actions}</View> : null}
        </View>
      ) : null}
      <Text variant={size} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="sec" tone="secondary">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
