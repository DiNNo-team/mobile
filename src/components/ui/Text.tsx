import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

/** Type scale of manual v2.0 section 4; each variant carries its own Plus Jakarta Sans weight. */
const variants = {
  display: 'text-display font-extrabold',
  h1: 'text-h1 font-extrabold',
  h2: 'text-h2 font-bold',
  h3: 'text-h3 font-bold',
  body: 'text-body font-sans',
  sec: 'text-sec font-sans',
  label: 'text-label font-bold',
  kicker: 'text-kicker font-bold uppercase',
  metric: 'text-metric font-extrabold',
  figure: 'text-figure font-extrabold',
  button: 'text-button font-bold',
  fieldLabel: 'text-sec font-bold',
  chip: 'text-chip font-bold',
} as const;

const tones = {
  default: 'text-fg',
  secondary: 'text-fg-2',
  accent: 'text-accent-text',
  error: 'text-error',
  onAccent: 'text-on-accent',
  onBrand: 'text-on-brand',
  onInverse: 'text-on-inverse',
  inverseAccent: 'text-inverse-accent',
} as const;

export type TextVariant = keyof typeof variants;
export type TextTone = keyof typeof tones;

export interface TextProps extends NativeTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /** Numbers that change (counters, hours): tabular figures. */
  tabular?: boolean;
  /** Layout only (margins, alignment). Color and size come from `variant` and `tone`. */
  className?: string;
}

/** The only text component of the app: never use React Native's `Text` directly. */
export function Text({ variant = 'body', tone = 'default', tabular, className, ...props }: TextProps) {
  const classes = [variants[variant], tones[tone], tabular || variant === 'figure' ? 'tabular-nums' : '', className]
    .filter(Boolean)
    .join(' ');
  return <NativeText className={classes} {...props} />;
}
