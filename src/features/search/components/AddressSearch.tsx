import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Alert, Button, Text, TextField } from '@/components/ui';

import { ADDRESS_TEXT, getAddressErrorMessage, locateAddress, normalizeAddress, validateAddress } from '../address';
import type { GeocodeResult } from '../types';

export interface LocatedAddress extends GeocodeResult {
  /** What the diner typed, to show it again in the field. */
  query: string;
}

interface AddressSearchProps {
  /** The address of the current search, if it is one: the field starts with it. */
  initialQuery: string;
  onLocated: (address: LocatedAddress) => void;
}

/**
 * "Buscar por dirección" (PBI 2.2, CLAUDE.md §10): GET /geocode only when the diner confirms with the button or
 * the keyboard's search key, never while typing; the button is disabled while it looks, and the same address is
 * not asked twice (closing notes, point 6). 404/503 show the app's own text and the zones stay just below.
 */
export function AddressSearch({ initialQuery, onLocated }: AddressSearchProps) {
  const [text, setText] = useState(initialQuery);
  const [fieldError, setFieldError] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (searching) return;
    const invalid = validateAddress(text);
    setFieldError(invalid);
    setFailure(undefined);
    if (invalid) return;
    setSearching(true);
    try {
      const result = await locateAddress(text);
      onLocated({ ...result, query: normalizeAddress(text) });
    } catch (error) {
      setFailure(getAddressErrorMessage(error));
    } finally {
      setSearching(false);
    }
  };

  return (
    <View className="gap-3">
      <Text variant="label" tone="secondary">
        Dirección
      </Text>
      <TextField
        label={ADDRESS_TEXT.label}
        placeholder={ADDRESS_TEXT.placeholder}
        icon={Search}
        value={text}
        onChangeText={(value) => {
          setText(value);
          if (fieldError) setFieldError(undefined);
        }}
        errorText={fieldError}
        disabled={searching}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={search}
      />
      {failure ? <Alert type="error" message={failure} /> : null}
      <Button
        variant="secondary"
        label={ADDRESS_TEXT.search}
        loading={searching}
        loadingLabel={ADDRESS_TEXT.searching}
        fullWidth
        onPress={search}
      />
    </View>
  );
}
