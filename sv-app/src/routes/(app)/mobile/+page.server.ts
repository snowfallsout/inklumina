import type { PageServerLoad } from './$types';
import { mobilePageData } from '$lib/features/mobile/data';

export const load: PageServerLoad = () => ({ payload: mobilePageData });
