import type { Socket } from 'socket.io-client';

import { onReconnect } from './socket';

/** Just what onReconnect uses of a Socket.IO client. */
function fakeSocket(connected: boolean) {
  const handlers = new Set<() => void>();
  const socket = {
    connected,
    on: (_event: string, handler: () => void) => handlers.add(handler),
    off: (_event: string, handler: () => void) => handlers.delete(handler),
  };
  return { socket: socket as unknown as Socket, connect: () => handlers.forEach((handler) => handler()) };
}

describe('onReconnect', () => {
  it('skips the first connection and fires on every later one', () => {
    const { socket, connect } = fakeSocket(false);
    const handler = jest.fn();
    onReconnect(socket, handler);
    connect();
    expect(handler).not.toHaveBeenCalled();
    connect();
    connect();
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('a subscriber added while already connected fires on the next connection', () => {
    const { socket, connect } = fakeSocket(true);
    const handler = jest.fn();
    const off = onReconnect(socket, handler);
    connect();
    expect(handler).toHaveBeenCalledTimes(1);
    off();
    connect();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
