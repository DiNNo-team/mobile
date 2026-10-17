import { CircleAlert, Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { useState, type Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Text } from './Text';

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'editable'> {
  /** Always visible above the field (manual 10). */
  label: string;
  /** Adds "(opcional)" to the label; required fields carry no mark. */
  optional?: boolean;
  /** Help under the field; an error replaces it. */
  helperText?: string;
  /** What to do, not "Campo requerido": "Escribe tu correo". */
  errorText?: string;
  /** Optional icon on the left (20). */
  icon?: LucideIcon;
  /** Password: hides the text and adds the eye button. */
  password?: boolean;
  disabled?: boolean;
  ref?: Ref<TextInput>;
  /** Layout only (margins). */
  className?: string;
}

/** Text field (manual 9 and 10): 48 tall, radius 12, 1.5 border; focus in orange, error in red with icon. */
export function TextField({
  label,
  optional = false,
  helperText,
  errorText,
  icon,
  password = false,
  disabled = false,
  ref,
  className,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const hasError = !!errorText;

  return (
    <View className={cn('gap-2', className)}>
      <Text variant="fieldLabel">
        {label}
        {optional ? <Text variant="sec" tone="secondary"> (opcional)</Text> : null}
      </Text>
      <View
        className={cn(
          'h-12 flex-row items-center gap-2 rounded-input border-1.5 px-3',
          disabled ? 'border-line bg-surface-2' : 'bg-surface',
          !disabled && (hasError ? 'border-error' : focused ? 'border-accent' : 'border-line-strong'),
        )}
      >
        {icon ? <Icon icon={icon} color="text2" /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={errorText ?? helperText}
          accessibilityState={{ disabled }}
          editable={!disabled}
          secureTextEntry={password && hidden}
          placeholderTextColor={colors.text2}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn('h-full flex-1 font-sans text-body', disabled ? 'text-fg-2' : 'text-fg')}
          {...props}
        />
        {password ? (
          <IconButton
            icon={hidden ? Eye : EyeOff}
            accessibilityLabel={hidden ? 'Ver contraseña' : 'Ocultar contraseña'}
            color="text2"
            onPress={() => setHidden((value) => !value)}
            disabled={disabled}
            className="-mr-2"
          />
        ) : null}
      </View>
      {hasError ? (
        <View className="flex-row items-start gap-1" accessibilityLiveRegion="polite">
          <Icon icon={CircleAlert} size={16} color="error" />
          <Text variant="sec" tone="error" className="flex-1">
            {errorText}
          </Text>
        </View>
      ) : helperText ? (
        <Text variant="sec" tone="secondary">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
