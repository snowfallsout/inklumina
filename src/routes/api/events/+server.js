import { subscribe, getState } from '$lib/server/colorfield.js';

function encode(event, data) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function GET() {
  const encoder = new TextEncoder();
  let unsubscribe = null;
  let heartbeat = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event, data) => {
        controller.enqueue(encoder.encode(encode(event, data)));
      };

      send('state', getState());
      unsubscribe = subscribe(send);
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(':keepalive\n\n'));
      }, 25000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
