import createQr from 'qrcode-generator';

import { QR_QUIET_ZONE, reservationQr } from './qr';

/** Paints the path back onto a grid: every `M{x} {y}h{w}v1h-{w}z` is one run of dark modules. */
function paint(path: string, size: number): boolean[][] {
  const grid = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  for (const [, x, y, w] of path.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
    for (let col = Number(x); col < Number(x) + Number(w); col += 1) grid[Number(y)][col] = true;
  }
  return grid;
}

describe('reservationQr', () => {
  it('draws a version 1 QR (21 modules) plus the quiet zone for a 6-character code', () => {
    expect(reservationQr('K7M4QX').size).toBe(21 + QR_QUIET_ZONE * 2);
  });

  it('paints exactly the dark modules of the encoded code, shifted by the quiet zone', () => {
    const { size, path } = reservationQr('P3R8TW');
    const expected = createQr(0, 'M');
    expected.addData('P3R8TW', 'Alphanumeric');
    expected.make();

    const grid = paint(path, size);
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const inside = row >= QR_QUIET_ZONE && col >= QR_QUIET_ZONE && row < size - QR_QUIET_ZONE && col < size - QR_QUIET_ZONE;
        const dark = inside && expected.isDark(row - QR_QUIET_ZONE, col - QR_QUIET_ZONE);
        expect(grid[row][col]).toBe(dark);
      }
    }
  });

  it('leaves the quiet zone light and starts the top-left finder square right after it', () => {
    const { size, path } = reservationQr('K7M4QX');
    const grid = paint(path, size);
    expect(grid[0].some(Boolean)).toBe(false);
    expect(grid[size - 1].some(Boolean)).toBe(false);
    expect(grid[QR_QUIET_ZONE].slice(QR_QUIET_ZONE, QR_QUIET_ZONE + 7).every(Boolean)).toBe(true);
  });

  it('gives a different drawing for a different code and the same drawing for the same code', () => {
    expect(reservationQr('K7M4QX').path).toBe(reservationQr('K7M4QX').path);
    expect(reservationQr('K7M4QX').path).not.toBe(reservationQr('P3R8TW').path);
  });
});
