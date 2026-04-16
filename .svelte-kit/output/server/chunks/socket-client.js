import { io } from "socket.io-client";
//#region src/lib/shared/socket-client.ts
function createColorfieldSocket() {
	return io({ path: "/socket.io" });
}
//#endregion
export { createColorfieldSocket as t };
