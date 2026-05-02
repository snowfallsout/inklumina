/*
 * src/lib/shared/socket-client.ts
 * Purpose: Provide a typed Socket.IO client factory bound to the shared Colorfield event contracts.
 */
import { browser } from '$app/environment';
import { io, type Socket } from 'socket.io-client';
import type { ColorfieldClientToServerEvents, ColorfieldServerToClientEvents } from '$lib/shared/contracts';

export type ColorfieldSocket = Socket<ColorfieldServerToClientEvents, ColorfieldClientToServerEvents>;

type BrowserWindowWithIO = Window & {
  io?: (url?: string) => ColorfieldSocket;
};

export function createColorfieldSocket(url?: string): ColorfieldSocket {
  if (!browser) {
    throw new Error('createColorfieldSocket() must run in the browser');
  }

  const globalIo = (window as BrowserWindowWithIO).io;
  if (typeof globalIo === 'function') {
    return globalIo(url);
  }

  return io(url);
}