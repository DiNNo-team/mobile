import type { LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon, type IconColor } from './Icon';
import { Spinner } from './Spinner';
import { Text, type TextTone } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
/** `md` 48 (default), `float` 44 (floating cards over the map), `sm` 40 (compact rows). */
export type ButtonSize = 'md' | 'float' | 'sm';

const variantClasses: Record<ButtonVariant, { base: string; pressed: string }> = {
  primary: { base: 'bg-accent', pressed: 'bg-accent-pressed' },
  secondary: { base: 'bg-brand', pressed: 'bg-brand opacity-90' },
  outline: { base: 'bg-surface border-1.5 border-line-strong', pressed: 'bg-surface-2 border-1.5 border-line-strong' },
  ghost: { base: 'bg-transparent', pressed: 'bg-surface-2' },
  danger: { base: 'bg-surface border-1.5 border-error', pressed: 'bg-error/10 border-1.5 border-error' },
};

const variantTone: Record<ButtonVariant, { text: TextTone; icon: IconColor }> = {
  primary: { text: 'onAccent', icon: 'onAccent' },
  secondary: { text: 'onBrand', icon: 'onBrand' },
  outline: { text: 'default', icon: 'text' },
  ghost: { text: 'accent', icon: 'accentText' },
  danger: { text: 'error', icon: 'error' },
};

const sizeClasses: Record<ButtonSize, string> = { md: 'h-12 px-5', float: 'h-11 px-5', sm: 'h-10 px-4' };

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Verb + object (manual 14): "Guardar cambios", "Cómo llegar". */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional icon on the left (20). */
  icon?: LucideIcon;
  /** Something on the left that is not a Lucide icon, such as a third-party logo (`<GoogleLogo />`). */
  leading?: ReactNode;
  /** While true: spinner + `loadingLabel`, same width, cannot be pressed again. */
  loading?: boolean;
  /** Gerund shown while loading: "Guardando…", "Creando cuenta…". */
  loadingLabel?: string;
  fullWidth?: boolean;
  /** Layout only (margins). */
  className?: string;
}

/**
 * Manual 6.1. One `primary` per screen, ink text on orange. `danger` is never filled red and lives in a
 * confirmation Dialog. Disabled only while saving or when the action cannot apply, never for invalid data.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  leading,
  loading = false,
  loadingLabel,
  fullWidth = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const [idleWidth, setIdleWidth] = useState<number>();
  const inactive = disabled || loading;
  const tone = variantTone[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={loading ? (loadingLabel ?? label) : label}
      accessibilityState={{ disabled: !!inactive, busy: loading }}
      disabled={inactive}
      onLayout={(event) => {
        if (!loading) setIdleWidth(event.nativeEvent.layout.width);
      }}
      style={loading && idleWidth ? { minWidth: idleWidth } : undefined}
      className={cn(fullWidth ? 'self-stretch' : 'self-start', className)}
      {...props}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'flex-row items-center justify-center gap-2 rounded-btn',
            sizeClasses[size],
            pressed && !inactive ? variantClasses[variant].pressed : variantClasses[variant].base,
            disabled && 'opacity-45',
          )}
        >
          {loading ? <Spinner color={tone.icon} /> : icon ? <Icon icon={icon} color={tone.icon} /> : leading}
          <Text variant="button" tone={tone.text} numberOfLines={1}>
            {loading ? (loadingLabel ?? label) : label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
