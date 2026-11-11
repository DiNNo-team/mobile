import type { LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { primaryTapHaptic } from '@/lib/haptics';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

import { Icon, type IconColor } from './Icon';
import { Spinner } from './Spinner';
import { Text, type TextTone } from './Text';
import { usePressScale } from './use-press-scale';

/**
 * Mobile v3 adds three matte variants for the diner screens: `soft` (Arena in light, Relieve in dark: «Cómo llegar»),
 * `raised` (Loza with a soft shadow in light, Relieve in dark) and `quiet` (text only in the danger color: «Cancelar
 * reserva», no border). `tinted` is the 10% cream/ink piece inside a card («Ver restaurante»).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'soft' | 'raised' | 'tinted' | 'quiet';
/**
 * `md` 48 (default), `float` 44 (floating cards over the map), `sm` 40 (compact rows). Mobile v3: `field` 50 (pieces
 * inside cards), `lg` 56 (ticket actions) and `xl` 58 (the detail's action bar).
 */
export type ButtonSize = 'md' | 'float' | 'sm' | 'field' | 'lg' | 'xl';

const variantClasses: Record<ButtonVariant, { base: string; pressed: string }> = {
  primary: { base: 'bg-accent', pressed: 'bg-accent-pressed' },
  // Same tokens as the web (manual 12.2): petrol + cream in light, cream + ink in dark.
  secondary: { base: 'bg-inverse', pressed: 'bg-inverse opacity-90' },
  outline: { base: 'bg-surface border-1.5 border-line-strong', pressed: 'bg-surface-2 border-1.5 border-line-strong' },
  ghost: { base: 'bg-transparent', pressed: 'bg-surface-2' },
  danger: { base: 'bg-surface border-1.5 border-error', pressed: 'bg-error/10 border-1.5 border-error' },
  soft: { base: 'bg-sand', pressed: 'bg-sand opacity-90' },
  raised: { base: 'bg-surface dark:bg-sand', pressed: 'bg-surface-2 dark:bg-sand dark:opacity-90' },
  tinted: { base: 'bg-surface-2 dark:bg-fg/10', pressed: 'bg-sand dark:bg-fg/15' },
  quiet: { base: 'bg-transparent', pressed: 'bg-fg/5' },
};

const variantTone: Record<ButtonVariant, { text: TextTone; icon: IconColor }> = {
  primary: { text: 'onAccent', icon: 'onAccent' },
  secondary: { text: 'onInverse', icon: 'inverseText' },
  outline: { text: 'default', icon: 'text' },
  ghost: { text: 'accent', icon: 'accentText' },
  danger: { text: 'error', icon: 'error' },
  soft: { text: 'default', icon: 'text' },
  raised: { text: 'default', icon: 'text' },
  tinted: { text: 'default', icon: 'text' },
  quiet: { text: 'danger', icon: 'dangerText' },
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-12 px-5',
  float: 'h-11 px-5',
  sm: 'h-10 px-4',
  field: 'h-[50px] px-5',
  lg: 'h-14 px-5',
  xl: 'h-[58px] px-5',
};

/** Label size per button height: the action bar's «Reservar mesa» is 17/800, the ticket's actions 16/700. */
const sizeText: Record<ButtonSize, 'button' | 'buttonLg' | 'action'> = {
  md: 'button',
  float: 'button',
  sm: 'button',
  field: 'button',
  lg: 'buttonLg',
  xl: 'button',
};

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Verb + object (manual 14): "Guardar cambios", "Cómo llegar". */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional icon on the left (20). */
  icon?: LucideIcon;
  /** Optional icon after the label (mobile v3: «Cómo llegar →», «Ver restaurante →»). */
  trailingIcon?: LucideIcon;
  /** `rounded` (radius 14, manual 12.2) or `pill` (mobile v3: fully round, the primary glows orange). */
  shape?: 'rounded' | 'pill';
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
 * Manual 12.2. One `primary` per context, ink text on orange, with a light haptic tap. Every variant sinks to 0.97
 * when pressed. `danger` is never filled red and lives in a confirmation Dialog. Disabled only while saving or when
 * the action cannot apply, never for invalid data.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  shape = 'rounded',
  leading,
  loading = false,
  loadingLabel,
  fullWidth = false,
  disabled,
  className,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const [idleWidth, setIdleWidth] = useState<number>();
  const inactive = disabled || loading;
  const tone = variantTone[variant];
  const press = usePressScale();
  const { colors } = useTheme();
  const pill = shape === 'pill';
  const labelVariant = variant === 'primary' && size === 'xl' ? 'action' : sizeText[size];
  const shadow = pill && !disabled
    ? variant === 'primary'
      ? colors.shadowAccent
      : variant === 'raised'
        ? colors.shadowRaised
        : undefined
    : undefined;

  const handlePress = (event: GestureResponderEvent) => {
    if (variant === 'primary') primaryTapHaptic();
    onPress?.(event);
  };

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
      onPress={handlePress}
      onPressIn={(event) => {
        press.onPressIn();
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        press.onPressOut();
        onPressOut?.(event);
      }}
      {...props}
    >
      {({ pressed }) => (
        <Animated.View
          style={[press.style, shadow ? { boxShadow: shadow } : null]}
          className={cn(
            'flex-row items-center justify-center gap-2',
            pill ? 'rounded-chip' : 'rounded-btn',
            sizeClasses[size],
            pressed && !inactive ? variantClasses[variant].pressed : variantClasses[variant].base,
            disabled && 'opacity-45',
          )}
        >
          {loading ? <Spinner color={tone.icon} /> : icon ? <Icon icon={icon} color={tone.icon} /> : leading}
          <Text variant={labelVariant} tone={tone.text} numberOfLines={1}>
            {loading ? (loadingLabel ?? label) : label}
          </Text>
          {trailingIcon && !loading ? <Icon icon={trailingIcon} size={18} color={tone.icon} strokeWidth={2.2} /> : null}
        </Animated.View>
      )}
    </Pressable>
  );
}
