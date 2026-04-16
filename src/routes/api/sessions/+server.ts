import { json } from '@sveltejs/kit';
import { getActive, getHistorySummaries } from '$lib/server/sessions';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return json({
		active: getActive(),
		history: getHistorySummaries(),
	});
};
