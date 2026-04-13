import { io, type Socket } from 'socket.io-client';

export type ColorfieldSocket = Socket;

export function createColorfieldSocket(): ColorfieldSocket {
	return io({ path: '/socket.io' });
}
