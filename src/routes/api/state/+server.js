import { json } from '@sveltejs/kit';
import { getState } from '$lib/server/colorfield.js';

export function GET() {
  return json(getState());
}
