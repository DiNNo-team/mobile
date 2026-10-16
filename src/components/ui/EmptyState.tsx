import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { BrandSymbol } from './Brand';
import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** At most one main action; on an empty screen it is usually the screen's only primary. */
  action?: ReactNode;
  /** Extra secondary actions under the main one (e.g. "Cambiar filtros", "Cambiar zona"). */
  secondaryActions?: ReactNode;
  /** `error`: same layout for load errors, announced to screen readers. */
  variant?: 'empty' | 'error';
  className?: string;
}

/** No data yet, or it could not load (manual 9 and 11.4). DiNNo symbol in outline, never a big icon. */
export function EmptyState({ title, description, action, secondaryActions, variant = 'empty', className }: EmptyStateProps) {
  return (
    <View
      accessibilityRole={variant === 'error' ? 'alert' : undefined}
      className={cn('w-full max-w-empty items-center gap-4 self-center px-4 py-12', className)}
    >
      <BrandSymbol variant="outline" />
      <View className="items-center gap-2">
        <Text variant="h3" className="text-center">
          {title}
        </Text>
        {description ? (
          <Text variant="sec" tone="secondary" className="text-center">
            {description}
          </Text>
        ) : null}
      </View>
      {action || secondaryActions ? (
        <View className="mt-2 items-center gap-2">
          {action}
          {secondaryActions}
        </View>
      ) : null}
    </View>
  );
}

/** Retry text of the manual (11.4), the same as the web. */
export const RETRY_LABEL = 'Intentar de nuevo';

export interface ErrorStateProps {
  /** "No pudimos cargar los restaurantes". */
  title: string;
  /** Usually `getErrorMessage(error)`: what happened + what to do. */
  description: string;
  onRetry: () => void;
  /** True while the retry runs: the button shows "Cargando…". */
  retrying?: boolean;
  className?: string;
}

/** Load error of a whole screen or section, with "Intentar de nuevo". */
export function ErrorState({ title, description, onRetry, retrying = false, className }: ErrorStateProps) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      className={className}
      action={<Button variant="outline" label={RETRY_LABEL} loading={retrying} loadingLabel="Cargando…" onPress={onRetry} />}
    />
  );
}
