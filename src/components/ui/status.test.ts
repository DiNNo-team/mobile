import { AVAILABILITY_PRESENTATION, getAvailabilityPresentation, OPEN_STATUS_PRESENTATION } from './status';

describe('availability presentation', () => {
  it('maps each API value to color + shape + word (manual 3.4, Reparto 2.2)', () => {
    expect(getAvailabilityPresentation('available')).toEqual({ label: 'Disponible', color: 'ok', shape: 'dot' });
    expect(getAvailabilityPresentation('few')).toEqual({ label: 'Pocas mesas', color: 'limited', shape: 'diamond' });
    expect(getAvailabilityPresentation('none')).toEqual({ label: 'Sin mesas', color: 'busy', shape: 'striped-square' });
    expect(getAvailabilityPresentation('closed')).toEqual({ label: 'Cerrado', color: 'inactive', shape: 'dash' });
  });

  it('covers exactly the four contract values and never shows a number', () => {
    expect(Object.keys(AVAILABILITY_PRESENTATION).sort()).toEqual(['available', 'closed', 'few', 'none']);
    Object.values(AVAILABILITY_PRESENTATION).forEach(({ label }) => expect(label).not.toMatch(/\d/));
  });

  it('every state has its own shape and color', () => {
    const values = Object.values(AVAILABILITY_PRESENTATION);
    expect(new Set(values.map((value) => value.shape)).size).toBe(values.length);
    expect(new Set(values.map((value) => value.color)).size).toBe(values.length);
  });

  it('open is live (pulsing dot) and closed uses the same dash as Cerrado', () => {
    expect(OPEN_STATUS_PRESENTATION.open).toMatchObject({ label: 'Abierto', shape: 'dot', live: true });
    expect(OPEN_STATUS_PRESENTATION.closed).toEqual(AVAILABILITY_PRESENTATION.closed);
  });
});
