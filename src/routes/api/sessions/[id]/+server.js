import { error, json } from '@sveltejs/kit';
import { deleteHistorySession, getHistorySession } from '$lib/server/colorfield.js';

export function GET({ params }) {
  const session = getHistorySession(params.id);
  if (!session) throw error(404, 'Session not found');
  return json(session);
}

export function DELETE({ params }) {
  const ok = deleteHistorySession(params.id);
  if (!ok) throw error(404, 'Session not found');
  return json({ ok: true });
}
