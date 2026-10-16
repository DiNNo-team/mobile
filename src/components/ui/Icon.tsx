import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { themes, type ColorScheme, type ThemeColors } from '@/theme/tokens';

export type IconSize = 16 | 20 | 24;
export type IconColor = keyof Pick<
  ThemeColors,
  'text' | 'text2' | 'accentText' | 'onAccent' | 'onBrand' | 'inverseText' | 'inverseAccent' | 'ok' | 'limited' | 'busy' | 'inactive' | 'error' | 'info'
>;

export interface IconProps {
  /** A Lucide icon (manual 8): `import { Search } from 'lucide-react-native'`. */
  icon: LucideIcon;
  /** 16 in chips and secondary text, 20 in buttons and fields, 24 for standalone actions. */
  size?: IconSize;
  color?: IconColor;
  /** Read the color from this scheme instead of the current one: icons on inverse surfaces (toasts). */
  scheme?: ColorScheme;
}

/** Lucide icon with the manual's stroke (1.75) and a token color. Decorative: the text next to it says what it is. */
export function Icon({ icon: LucideComponent, size = 20, color = 'text', scheme }: IconProps) {
  const { colors } = useTheme();
  return (
    <LucideComponent
      size={size}
      color={scheme ? themes[scheme][color] : colors[color]}
      strokeWidth={1.75}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
