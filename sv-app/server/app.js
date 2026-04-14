import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import * as sessions from './sessions.js';

function createApp() {
  const app = express();
  app.use(express.json());
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // Apply a relaxed CSP for exhibition/dev so MediaPipe CDN & inline scripts/styles work.
  // Include jsDelivr in default-src/worker/font/img so fetched WASM/.task assets are allowed.
  const csp = "default-src 'self' https://cdn.jsdelivr.net; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "img-src 'self' data: blob: http: https: https://cdn.jsdelivr.net; " +
    "connect-src 'self' ws: wss: http: https: https://cdn.jsdelivr.net; " +
    "font-src 'self' data: https://cdn.jsdelivr.net; " +
    "worker-src 'self' blob: https://cdn.jsdelivr.net; " +
    "frame-ancestors 'none';";

  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', csp);
    next();
  });

  const svelteOut = path.join(__dirname, '..', '.svelte-kit', 'output');
  const svelteClient = path.join(svelteOut, 'client');
  const prerenderedIndex = path.join(svelteOut, 'prerendered', 'pages', 'index.html');
  const staticDir = path.join(__dirname, '..', 'static');
  const svelteServerIndex = path.join(svelteOut, 'server', 'index.js');
  const svelteServerManifest = path.join(svelteOut, 'server', 'manifest.js');

  // Serve SvelteKit client output first when available
  if (fs.existsSync(svelteClient)) {
    app.use(express.static(svelteClient));
  }

  // Legacy static assets remain available under `/static`.
  app.use(express.static(staticDir));
  app.use('/static', express.static(staticDir));

  app.get('/', (req, res) => {
    try {
      if (fs.existsSync(prerenderedIndex)) {
        return res.send(fs.readFileSync(prerenderedIndex, 'utf8'));
      }
    } catch (err) {
      console.error('Error reading prerendered root index:', err);
    }

    return res.status(404).send('Home not found');
  });

  let svelteKitServerPromise;

  async function getSvelteKitServer() {
    if (!fs.existsSync(svelteServerIndex) || !fs.existsSync(svelteServerManifest)) {
      return null;
    }

    if (!svelteKitServerPromise) {
      svelteKitServerPromise = Promise.all([
        import(pathToFileURL(svelteServerIndex).href),
        import(pathToFileURL(svelteServerManifest).href)
      ]).then(async ([serverModule, manifestModule]) => {
        const kitServer = new serverModule.Server(manifestModule.manifest);
        await kitServer.init({ env: process.env });
        return kitServer;
      });
    }

    return svelteKitServerPromise;
  }

  app.get('/join', (req, res) => res.redirect('/mobile'));

  // Get current session + history list
  app.get('/api/sessions', (req, res) => {
    res.json({
      active: sessions.getActive(),
      history: sessions.getHistory().map(s => ({ id: s.id, name: s.name, createdAt: s.createdAt, total: s.total })),
    });
  });

  // Create a new session (archives current to history)
  app.post('/api/sessions/new', (req, res) => {
    const name = (req.body.name || '').trim() || `活动 ${sessions.getHistory().length + 2}`;
    const active = sessions.createNew(name);

    // Notify all clients to reset canvas if Socket.IO is available via app.locals.io
    if (req.app && req.app.locals && req.app.locals.io) {
      req.app.locals.io.emit('session_reset', { session: active });
    }

    console.log(`[Session] New: "${name}"`);
    res.json({ ok: true, active });
  });

  // Get a specific history session
  app.get('/api/sessions/:id', (req, res) => {
    const s = sessions.getHistoryById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Session not found' });
    res.json(s);
  });

  // Delete a history session
  app.delete('/api/sessions/:id', (req, res) => {
    const ok = sessions.deleteHistoryById(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Session not found' });
    console.log(`[Session] Deleted: ${req.params.id}`);
    res.json({ ok: true });
  });

  app.use(async (req, res, next) => {
    try {
      const kitServer = await getSvelteKitServer();
      if (!kitServer) {
        return res.status(503).send('SvelteKit build output not found. Run npm run build first.');
      }

      const origin = `${req.protocol}://${req.get('host')}`;
      const url = new URL(req.originalUrl, origin);
      const headers = new Headers();

      for (const [key, value] of Object.entries(req.headers)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const item of value) headers.append(key, item);
        } else {
          headers.set(key, value);
        }
      }

      const hasBody = !['GET', 'HEAD'].includes(req.method);
      const request = new Request(url, {
        method: req.method,
        headers,
        ...(hasBody ? { body: req, duplex: 'half' } : {})
      });

      const response = await kitServer.respond(request, {
        getClientAddress: () => req.socket.remoteAddress || '127.0.0.1'
      });

      res.status(response.status);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          res.append(key, value);
        } else {
          res.setHeader(key, value);
        }
      });

      if (response.body && !['HEAD', '204', '304'].includes(String(response.status))) {
        const body = Buffer.from(await response.arrayBuffer());
        return res.send(body);
      }

      return res.end();
    } catch (err) {
      return next(err);
    }
  });

  return app;
}

export default createApp;
