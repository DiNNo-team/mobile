import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

/**
 * The 21 × 21 modules drawn in the mobile v3 ticket. It is only the look of the QR: the QR check-in does not exist yet
 * (the restaurant validates the 6-character code), so nothing reads it. When the check-in by QR arrives, this draws
 * the real code instead.
 */
const MODULES =
  'M0 0h7v7H0zM1 1v5h5V1zM2 2h3v3H2zM14 0h7v7h-7zM15 1v5h5V1zM16 2h3v3h-3zM0 14h7v7H0zM1 15v5h5v-5zM2 16h3v3H2zM8 0h1v1H8zM10 0h2v1h-2zM9 1h1v1H9zM12 1h1v1h-1zM8 2h2v1H8zM11 2h1v1h-1zM10 3h3v1h-3zM8 4h1v1H8zM12 4h1v1h-1zM9 5h2v1H9zM8 6h1v1H8zM10 6h1v1h-1zM12 6h1v1h-1zM0 8h2v1H0zM3 8h1v1H3zM5 8h3v1H5zM9 8h2v1H9zM12 8h1v1h-1zM14 8h2v1h-2zM17 8h1v1h-1zM19 8h2v1h-2zM1 9h1v1H1zM4 9h2v1H4zM8 9h1v1H8zM11 9h3v1h-3zM16 9h2v1h-2zM20 9h1v1h-1zM0 10h1v1H0zM2 10h3v1H2zM6 10h2v1H6zM10 10h1v1h-1zM13 10h2v1h-2zM18 10h2v1h-2zM1 11h2v1H1zM5 11h1v1H5zM8 11h3v1H8zM12 11h1v1h-1zM15 11h1v1h-1zM17 11h1v1h-1zM19 11h2v1h-2zM0 12h1v1H0zM3 12h2v1H3zM7 12h1v1H7zM9 12h1v1H9zM11 12h2v1h-2zM14 12h3v1h-3zM20 12h1v1h-1zM8 14h2v1H8zM11 14h1v1h-1zM13 14h3v1h-3zM18 14h2v1h-2zM9 15h1v1H9zM12 15h2v1h-2zM16 15h1v1h-1zM20 15h1v1h-1zM8 16h1v1H8zM10 16h3v1h-3zM14 16h2v1h-2zM17 16h3v1h-3zM9 17h2v1H9zM13 17h1v1h-1zM15 17h1v1h-1zM19 17h1v1h-1zM8 18h1v1H8zM11 18h2v1h-2zM14 18h1v1h-1zM16 18h3v1h-3zM10 19h1v1h-1zM12 19h3v1h-3zM17 19h1v1h-1zM20 19h1v1h-1zM8 20h2v1H8zM11 20h1v1h-1zM14 20h2v1h-2zM18 20h2v1h-2z';

/** The QR tile of the ticket: 100 × 100, sunk in light, a cream card in dark so it always reads ink on light. */
export function ReservationQr() {
  const { colors, scheme } = useTheme();
  const dark = scheme === 'dark';
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-[100px] w-[100px] p-2.5"
      style={{ borderRadius: 18, backgroundColor: dark ? colors.text : colors.well, boxShadow: dark ? undefined : colors.shadowWell }}
    >
      <Svg width={80} height={80} viewBox="0 0 21 21">
        <Path d={MODULES} fill={dark ? colors.inverseText : colors.text} fillRule="evenodd" />
      </Svg>
    </View>
  );
}
