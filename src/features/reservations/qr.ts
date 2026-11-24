import createQr from 'qrcode-generator';

/** Light modules around the code (the QR "quiet zone"): scanners need it to find the three corner squares. */
export const QR_QUIET_ZONE = 2;

export interface QrDrawing {
  /** Side of the drawing in modules, quiet zone included: the `viewBox` is `0 0 size size`. */
  size: number;
  /** One SVG path with every dark module; each run of dark modules in a row is a single rectangle. */
  path: string;
}

/**
 * The QR of a reservation code (Sprint 4, QR check-in). It holds only the 6 characters, exactly as the restaurant would
 * type them: a USB barcode scanner "types" them into the web's check-in field and the camera reader gets the same text,
 * so the backend check-in does not change. Alphanumeric mode (the code alphabet is uppercase and digits) and level M
 * give the smallest QR (21 × 21) that still reads from a phone screen with some glare.
 */
export function reservationQr(code: string): QrDrawing {
  const qr = createQr(0, 'M');
  qr.addData(code, 'Alphanumeric');
  qr.make();

  const count = qr.getModuleCount();
  const segments: string[] = [];
  for (let row = 0; row < count; row += 1) {
    let col = 0;
    while (col < count) {
      if (!qr.isDark(row, col)) {
        col += 1;
        continue;
      }
      const start = col;
      while (col < count && qr.isDark(row, col)) col += 1;
      segments.push(`M${start + QR_QUIET_ZONE} ${row + QR_QUIET_ZONE}h${col - start}v1h${start - col}z`);
    }
  }
  return { size: count + QR_QUIET_ZONE * 2, path: segments.join('') };
}
