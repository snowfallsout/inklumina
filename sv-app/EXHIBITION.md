Exhibition Runbook

Quick steps to build-and-serve locally for an offline exhibition:

1. Install dependencies

```bash
npm install
```

2. Build frontend and start server (single-process)

```bash
npm run build-and-serve
```

This runs `vite build` then `node server/index.js`. The server will prefer the built frontend output (./build) if present, otherwise it serves ./static/.

Checklist before opening to visitors:

- Network: ensure host PC and mobile devices are on the same LAN; open firewall for port 3000.
- IP/QR: use the local IP printed by the server to create QR codes for visitors.
- Sessions file: verify `sessions.json` is writable and backed up.
- Smoke test: open multiple mobile devices, submit MBTI, and confirm display shows `spawn_particles`.
- Auto-restart: consider `pm2 start server/index.js` for unattended runs.

Troubleshooting

- If pages don't load, check whether the server logged the local IP and that the `build/` folder exists after `npm run build`.
- If sessions appear to reset unexpectedly, check `sessions.json` and the server logs for write errors.

Notes

- For development use `npm run dev` (Vite dev server) and `npm run dev:socket` (Socket.IO server) in separate terminals.
- This local single-process approach is recommended for offline exhibitions for stability and predictability.
