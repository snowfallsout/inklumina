import { json, error } from '@sveltejs/kit';
import { getHistoryById, deleteHistoryById } from '$lib/server/sessions';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
	const session = getHistoryById(params.id);
	if (!session) throw error(404, 'Session not found');
	return json(session);
};

export const DELETE: RequestHandler = ({ params }) => {
	const ok = deleteHistoryById(params.id);
	if (!ok) throw error(404, 'Session not found');
	console.log(`[Session] Deleted: ${params.id}`);
	return json({ ok: true });
};
