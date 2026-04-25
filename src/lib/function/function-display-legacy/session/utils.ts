export const STORAGE_KEY = 'colorfield_pc_ip';

export function sanitizeHost(raw: string): string {
	return raw.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

export function buildJoinUrl(raw: string): string {
	const host = sanitizeHost(raw);
	const withPort =
		host.includes(':') || typeof window === 'undefined' || !window.location.port
			? host
			: `${host}:${window.location.port}`;
	return `http://${withPort}/mobile`;
}
