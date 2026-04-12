import { error, json } from '@sveltejs/kit';
import { submitMbti } from '$lib/server/colorfield.js';

export async function POST({ request }) {
  const body = await request.json().catch(() => ({}));
  const payload = submitMbti(body?.mbti || '');
  if (!payload) throw error(400, 'Invalid MBTI');
  return json({ ok: true, ...payload });
}
