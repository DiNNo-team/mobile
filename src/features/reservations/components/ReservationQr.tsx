import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Button, CodeCells, Dialog, usePressScale } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

import { RESERVATION_TEXT, spokenCode } from '../messages';
import { reservationQr } from '../qr';

const TILE = 100;
const LARGE = 248;

/**
 * Always ink on light, also in dark mode: scanners and cameras read dark modules on a light ground, and many cannot
 * read the inverted QR. In light the tile is sunk (`well`); in dark it is a cream card.
 */
function QrDrawing({ code, size, padding }: { code: string; size: number; padding: number }) {
  const { colors, scheme } = useTheme();
  const dark = scheme === 'dark';
  const { size: modules, path } = useMemo(() => reservationQr(code), [code]);
  return (
    <View
      style={{
        width: size,
        height: size,
        padding,
        borderRadius: 18,
        backgroundColor: dark ? colors.text : colors.well,
        boxShadow: dark ? undefined : colors.shadowWell,
      }}
    >
      <Svg width={size - padding * 2} height={size - padding * 2} viewBox={`0 0 ${modules} ${modules}`}>
        <Path d={path} fill={dark ? colors.inverseText : colors.text} />
      </Svg>
    </View>
  );
}

/**
 * The QR of the ticket (Sprint 4, QR check-in): the reservation code, which the restaurant reads with a USB scanner or
 * the laptop camera, or types. Tapping it opens it large, with the code under it, so it reads from farther away.
 */
export function ReservationQr({ code }: { code: string }) {
  const [enlarged, setEnlarged] = useState(false);
  const press = usePressScale(0.96);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={RESERVATION_TEXT.qrEnlarge}
        accessibilityHint={RESERVATION_TEXT.codeHint}
        onPress={() => setEnlarged(true)}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
      >
        <Animated.View style={press.style}>
          <QrDrawing code={code} size={TILE} padding={6} />
        </Animated.View>
      </Pressable>
      <Dialog
        visible={enlarged}
        onClose={() => setEnlarged(false)}
        title={RESERVATION_TEXT.qrTitle}
        description={RESERVATION_TEXT.codeHint}
        actions={<Button variant="outline" label={RESERVATION_TEXT.qrClose} fullWidth onPress={() => setEnlarged(false)} />}
      >
        <View className="items-center gap-4">
          <QrDrawing code={code} size={LARGE} padding={12} />
          <CodeCells code={code} accessibilityLabel={`${RESERVATION_TEXT.codeLabel}: ${spokenCode(code)}`} />
        </View>
      </Dialog>
    </>
  );
}
