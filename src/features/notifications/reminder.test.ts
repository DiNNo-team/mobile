import { NOTIFICATION_TEXT } from './messages';
import { leadMinutes, reminderDelaySeconds, reminderLeadMs } from './reminder';

const MINUTE = 60_000;

describe('reminder', () => {
  it('reminds 5 minutes before the end of a 15-minute reservation', () => {
    expect(reminderLeadMs(15 * MINUTE)).toBe(5 * MINUTE);
    expect(reminderDelaySeconds(15 * MINUTE, 15 * MINUTE)).toBe(600);
    expect(leadMinutes(15 * MINUTE)).toBe(5);
  });

  it('reminds 1 minute before in a short reservation (the 3-minute expiry demo)', () => {
    expect(reminderLeadMs(3 * MINUTE)).toBe(MINUTE);
    expect(reminderDelaySeconds(3 * MINUTE, 3 * MINUTE)).toBe(120);
    expect(leadMinutes(3 * MINUTE)).toBe(1);
  });

  it('no reminder when less than the lead is left, or the reservation is over', () => {
    expect(reminderDelaySeconds(4 * MINUTE, 15 * MINUTE)).toBeNull();
    expect(reminderDelaySeconds(5 * MINUTE + 500, 15 * MINUTE)).toBeNull();
    expect(reminderDelaySeconds(0, 15 * MINUTE)).toBeNull();
  });

  it('counts from what is left, not from the start (the app opened halfway)', () => {
    expect(reminderDelaySeconds(8 * MINUTE, 15 * MINUTE)).toBe(180);
  });
});

describe('reminder text', () => {
  it('agrees with the number of minutes', () => {
    expect(NOTIFICATION_TEXT.reminderBody('Casa 72', 1)).toBe(
      'Te queda 1 minuto para llegar a Casa 72. Si ya no vas, cancélala para liberar la mesa.',
    );
    expect(NOTIFICATION_TEXT.reminderBody('Casa 72', 5)).toMatch(/^Te quedan 5 minutos para llegar a Casa 72\./);
  });
});
