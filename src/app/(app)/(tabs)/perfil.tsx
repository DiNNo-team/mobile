import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientGround } from '@/components/AmbientGround';
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
import { formatAppVersion, getDisplayName, getInitial } from '@/features/account/profile-display';
import { useMeQuery } from '@/features/account/queries';
import { NOTIFICATION_TEXT } from '@/features/notifications/messages';
import { unregisterThisPhone, usePushPermission, type PermissionState } from '@/features/notifications/push';
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
const AVATAR_SIZE = 76;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** The same raised circle as the Perfil button in Explorar, larger and with the initial of the name. */
function Avatar({ name }: { name: string }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="items-center justify-center rounded-chip"
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, backgroundColor: colors.avatar, boxShadow: colors.shadowRaised }}
    >
      <Text variant="title">{getInitial(name)}</Text>
    </View>
  );
}

/** Who is signed in: avatar, name and email of GET /me, centered, without a card around it. */
function Identity({ profile }: { profile: Me }) {
  const name = getDisplayName(profile);
  return (
    <View className="items-center gap-3">
      <Avatar name={name} />
      <View className="items-center gap-0.5">
        <Text variant="h2" numberOfLines={2} className="text-center">
          {name}
        </Text>
        <Text variant="sec" tone="secondary" numberOfLines={1} className="text-center">
          {profile.email}
        </Text>
      </View>
    </View>
  );
}

function IdentitySkeleton() {
  return (
    <View accessibilityLabel="Cargando tu perfil" className="items-center gap-3">
      <Skeleton className="h-[76px] w-[76px] rounded-chip" />
      <Skeleton className="h-7 w-40 rounded-input" />
      <Skeleton className="h-4 w-48 rounded-input" />
    </View>
  );
}

const NOTIFICATION_STATE_TEXT: Record<PermissionState, string> = {
  unknown: NOTIFICATION_TEXT.rowOff,
  undetermined: NOTIFICATION_TEXT.rowOff,
  granted: NOTIFICATION_TEXT.rowOn,
  blocked: NOTIFICATION_TEXT.rowBlocked,
};

/** Whether this phone gets the reservation notifications, with the way to turn them on (Sprint 4). */
function NotificationsRow() {
  const state = usePushPermission((store) => store.state);
  const request = usePushPermission((store) => store.request);
  return (
    <View className="flex-row items-center gap-3">
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="strong">{NOTIFICATION_TEXT.rowTitle}</Text>
        <Text variant="sec" tone="secondary">
          {NOTIFICATION_STATE_TEXT[state]}
        </Text>
      </View>
      {state === 'undetermined' || state === 'blocked' ? (
        <Button
          size="sm"
          variant="outline"
          label={state === 'blocked' ? NOTIFICATION_TEXT.openSettings : NOTIFICATION_TEXT.activate}
          onPress={() => void request()}
        />
      ) : null}
    </View>
  );
}

/**
 * Perfil (Sprint 4, simple version): who is signed in, the theme and «Cerrar sesión» with confirmation, plus the version.
 * Opens from the avatar in Explorar's search field and goes back to it (mobile v3 has no bottom bar).
 */
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
      // This phone stops getting this diner's notifications before the session ends (it needs the token).
      await unregisterThisPhone();
      await signOut();
    } catch {
      setSigningOut(false);
      setConfirmingSignOut(false);
      showToast({ type: 'error', message: SIGN_OUT_ERROR });
    }
  };

  const renderIdentity = () => {
    if (me.data) {
      return (
        <View className="gap-4">
          {me.isError ? (
            // A failed refresh keeps the last data on screen and says so (the full error state is for no data).
            <Alert
              type="error"
              message={getErrorMessage(me.error)}
              action={<Button size="sm" variant="outline" label={RETRY_LABEL} onPress={() => me.refetch()} />}
            />
          ) : null}
          <Identity profile={me.data} />
        </View>
      );
    }
    if (me.isPending) return showSkeleton ? <IdentitySkeleton /> : <View style={{ height: AVATAR_SIZE }} />;
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
    <View className="flex-1">
      <AmbientGround variant="screen" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow gap-8 px-4"
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}
      >
        <ScreenHeader title="Perfil" showBack onBack={goBack} />
        {renderIdentity()}

        <Card>
          <View className="gap-3">
            <Text variant="strong">Tema</Text>
            <SegmentedControl options={THEME_OPTIONS} value={preference} onChange={setPreference} accessibilityLabel="Tema" />
          </View>
        </Card>

        <Card>
          <NotificationsRow />
        </Card>

        {/* Pushes «Cerrar sesión» and the version to the bottom when the screen is taller than the content. */}
        <View className="flex-1" />

        <View className="gap-2">
          <Button variant="quiet" shape="pill" size="field" label="Cerrar sesión" fullWidth onPress={() => setConfirmingSignOut(true)} />
          {version ? (
            <Text variant="sec" tone="caption" className="text-center">
              {version}
            </Text>
          ) : null}
        </View>

        <Dialog
          visible={confirmingSignOut}
          onClose={() => setConfirmingSignOut(false)}
          busy={signingOut}
          title="¿Cerrar sesión?"
          description="Tendrás que iniciar sesión de nuevo para buscar mesa."
          actions={
            <>
              <Button
                label="Cerrar sesión"
                fullWidth
                loading={signingOut}
                loadingLabel="Cerrando sesión…"
                onPress={confirmSignOut}
              />
              <Button
                variant="outline"
                label="Cancelar"
                fullWidth
                disabled={signingOut}
                onPress={() => setConfirmingSignOut(false)}
              />
            </>
          }
        />
      </ScrollView>
    </View>
  );
}
