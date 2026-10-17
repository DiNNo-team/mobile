import Svg, { Circle, ClipPath, Defs, G, Line, Polygon, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

import type { StatusColor, StatusShapeKind } from './status';

export interface StatusShapeProps {
  shape: StatusShapeKind;
  color: StatusColor;
  /** 8 inside chips; bigger inside map markers. */
  size?: number;
}

/** The shape of a state (manual 3.1): dot, diamond, striped square or dash. */
export function StatusShape({ shape, color, size = 8 }: StatusShapeProps) {
  const { colors } = useTheme();
  const fill = colors[color];
  const s = size;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} accessibilityElementsHidden importantForAccessibility="no">
      {shape === 'dot' ? <Circle cx={s / 2} cy={s / 2} r={s / 2} fill={fill} /> : null}
      {shape === 'diamond' ? (
        <Polygon points={`${s / 2},0 ${s},${s / 2} ${s / 2},${s} 0,${s / 2}`} fill={fill} />
      ) : null}
      {shape === 'striped-square' ? <StripedSquare size={s} fill={fill} /> : null}
      {shape === 'dash' ? <Rect x={0} y={(s * 3) / 8} width={s} height={s / 4} rx={s / 8} fill={fill} /> : null}
    </Svg>
  );
}

function StripedSquare({ size: s, fill }: { size: number; fill: string }) {
  const stroke = Math.max(1, s / 8);
  const stripes = [-s / 2, 0, s / 2, s];
  return (
    <>
      <Defs>
        <ClipPath id="striped-square-clip">
          <Rect x={0} y={0} width={s} height={s} rx={s / 8} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#striped-square-clip)">
        <Rect x={0} y={0} width={s} height={s} fill={fill} opacity={0.35} />
        {stripes.map((offset) => (
          <Line key={offset} x1={offset} y1={s} x2={offset + s} y2={0} stroke={fill} strokeWidth={stroke * 1.6} />
        ))}
      </G>
      <Rect x={stroke / 2} y={stroke / 2} width={s - stroke} height={s - stroke} rx={s / 8} fill="none" stroke={fill} strokeWidth={stroke} />
    </>
  );
}
