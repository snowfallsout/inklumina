import { g as getState, s as subscribe } from './colorfield-ChVzhFeK.js';
import 'fs';
import 'path';

function encode(event, data) {
  return `event: ${event}
data: ${JSON.stringify(data)}

`;
}
function GET() {
  const encoder = new TextEncoder();
  let unsubscribe = null;
  let heartbeat = null;
  const stream = new ReadableStream({
    start(controller) {
      const send = (event, data) => {
        controller.enqueue(encoder.encode(encode(event, data)));
      };
      send("state", getState());
      unsubscribe = subscribe(send);
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(":keepalive\n\n"));
      }, 25e3);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (heartbeat) clearInterval(heartbeat);
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}

export { GET };
//# sourceMappingURL=_server-BjgbjqBm.js.map
