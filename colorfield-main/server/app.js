const express = require('express');
const path = require('path');
const sessions = require('./sessions');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Route shortcuts
  app.get('/', (req, res) => res.redirect('/display.html'));
  app.get('/join', (req, res) => res.redirect('/mobile.html'));

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

  return app;
}

module.exports = createApp;
