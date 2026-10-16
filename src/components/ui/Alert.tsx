import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon, type IconColor } from './Icon';
import { Text } from './Text';

export type FeedbackType = 'success' | 'info' | 'warning' | 'error';

/** Manual 3.5: color and icon of each feedback type. */
export const FEEDBACK: Record<FeedbackType, { icon: LucideIcon; color: IconColor; background: string }> = {
  success: { icon: CircleCheck, color: 'ok', background: 'bg-ok/12' },
  info: { icon: Info, color: 'info', background: 'bg-info/12' },
  warning: { icon: TriangleAlert, color: 'limited', background: 'bg-limited/12' },
  error: { icon: CircleAlert, color: 'error', background: 'bg-error/12' },
};

export interface AlertProps {
  type: FeedbackType;
  /** Short and bold, optional: "Tu restaurante está cerrado". */
  title?: string;
  /** What happened + what to do (manual 14). */
  message: string;
  /** One small button: `<Button size="sm" variant="outline" label="Intentar de nuevo" />`. */
  action?: ReactNode;
  className?: string;
}

/**
 * Inline notice (manual 9 and 11): background 12% of the type color, icon 20 in the color, ink text,
 * radius 14, no shadow. Errors do not disappear on their own and are announced to screen readers.
 */
export function Alert({ type, title, message, action, className }: AlertProps) {
  const feedback = FEEDBACK[type];
  return (
    <View
      accessibilityRole={type === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion={type === 'error' ? 'assertive' : 'polite'}
      className={cn('gap-3 rounded-btn p-4', feedback.background, className)}
    >
      <View className="flex-row gap-3">
        <Icon icon={feedback.icon} color={feedback.color} />
        <View className="flex-1 gap-1">
          {title ? <Text variant="fieldLabel">{title}</Text> : null}
          <Text variant="sec">{message}</Text>
        </View>
      </View>
      {action ? <View className="flex-row justify-end">{action}</View> : null}
    </View>
  );
}
