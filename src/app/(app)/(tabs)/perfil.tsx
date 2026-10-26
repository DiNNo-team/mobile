import Constants from 'expo-constants';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceholderLink } from '@/components/ScreenPlaceholder';
import {
  Alert,
  Button,
  Card,
  Dialog,
  ErrorState,
  RETRY_LABEL,
  ScreenHeader,
  SegmentedControl,
  Skeleton,
  Text,
  useDelayedLoading,
  useToast,
} from '@/components/ui';
import { formatAppVersion, getDisplayName } from '@/features/account/profile-display';
import { useMeQuery } from '@/features/account/queries';
import type { Me } from '@/features/account/types';
import { useAuth } from '@/features/session/SessionProvider';
import { getErrorMessage } from '@/lib/api/errors';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
] as const satisfies readonly { value: ThemePreference; label: string }[];

const SIGN_OUT_ERROR = 'No pudimos cerrar sesión. Intenta de nuevo.';

/** Name and email of GET /me. The kit's Avatar, once published, goes before them in this card. */
function ProfileCard({ profile }: { profile: Me }) {
  return (
    <Card>
      <View className="gap-1">
        <Text variant="h3">{getDisplayName(profile)}</Text>
        <Text variant="sec" tone="secondary">
          {profile.email}
        </Text>
      </View>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <Card>
      <View accessibilityLabel="Cargando tu perfil" className="gap-2">
        <Skeleton className="h-6 w-40 rounded-input" />
        <Skeleton className="h-4 w-48 rounded-input" />
      </View>
    </Card>
  );
}

/** Profile tab (PBI "Consultar perfil y cerrar sesión"): name and email, theme, "Cerrar sesión" with confirmation, version. */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const me = useMeQuery();
  const showSkeleton = useDelayedLoading(me.isPending);
  const { signOut } = useAuth();
  const { preference, setPreference } = useTheme();
  const { showToast } = useToast();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const version = formatAppVersion(Constants.expoConfig?.version);

  // On success the session leaves the (app) group and this screen unmounts: nothing else to do here.
  const confirmSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
      setConfirmingSignOut(false);
      showToast({ type: 'error', message: SIGN_OUT_ERROR });
    }
  };

  const renderProfile = () => {
    if (me.data) {
      return (
        <>
          {me.isError ? (
            // A failed refresh keeps the last data on screen and says so (the full error state is for no data).
            <Alert
              type="error"
              message={getErrorMessage(me.error)}
              action={<Button size="sm" variant="outline" label={RETRY_LABEL} onPress={() => me.refetch()} />}
            />
          ) : null}
          <ProfileCard profile={me.data} />
        </>
      );
    }
    if (me.isPending) return showSkeleton ? <ProfileSkeleton /> : null;
    return (
      <ErrorState
        title="No pudimos cargar tu perfil"
        description={getErrorMessage(me.error)}
        retrying={me.isFetching}
        onRetry={() => me.refetch()}
      />
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="gap-6 px-4 pb-6"
      contentContainerStyle={{ paddingTop: insets.top + 16 }}
    >
      <ScreenHeader title="Perfil" />
      {renderProfile()}

      <View className="gap-2">
        <Text variant="label" tone="secondary">
          Tema
        </Text>
        <SegmentedControl options={THEME_OPTIONS} value={preference} onChange={setPreference} accessibilityLabel="Tema" />
      </View>

      <Button variant="outline" label="Cerrar sesión" fullWidth onPress={() => setConfirmingSignOut(true)} />

      {version ? (
        <Text variant="sec" tone="secondary" className="text-center">
          {version}
        </Text>
      ) : null}
      {__DEV__ ? <PlaceholderLink href="/kit" label="Ver el kit móvil" /> : null}

      <Dialog
        visible={confirmingSignOut}
        onClose={() => setConfirmingSignOut(false)}
        busy={signingOut}
        title="¿Cerrar sesión?"
        description="Tendrás que iniciar sesión de nuevo para buscar mesa."
        actions={
          <>
            <Button label="Cerrar sesión" fullWidth loading={signingOut} loadingLabel="Cerrando sesión…" onPress={confirmSignOut} />
            <Button variant="outline" label="Cancelar" fullWidth disabled={signingOut} onPress={() => setConfirmingSignOut(false)} />
          </>
        }
      />
    </ScrollView>
  );
}
