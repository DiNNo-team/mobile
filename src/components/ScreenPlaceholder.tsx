import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';

interface ScreenPlaceholderProps {
  title: string;
  description: string;
  /** Who builds the real screen and in which phase. */
  owner: string;
  children?: ReactNode;
}

/** Temporary screen for routes that exist before their real content (Sprint 2, phase 1). */
export function ScreenPlaceholder({ title, description, owner, children }: ScreenPlaceholderProps) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="px-4 pb-8"
      contentContainerStyle={{ paddingTop: insets.top + 24 }}
    >
      <Text variant="label" tone="secondary">
        Pantalla pendiente · {owner}
      </Text>
      <Text variant="h1" className="mt-2">
        {title}
      </Text>
      <Text variant="sec" tone="secondary" className="mt-2">
        {description}
      </Text>
      {children ? <View className="mt-8 gap-3">{children}</View> : null}
    </ScrollView>
  );
}

/** Text link with a 44 pt touch target, for the placeholders' navigation. */
export function PlaceholderLink({ href, label }: { href: Href; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" className="min-h-11 justify-center">
        <Text variant="button" tone="accent">
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}
