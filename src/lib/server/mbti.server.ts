/**
 * src/lib/server/mbti.server.ts
 *
 * Purpose:
 * Server-side helper that derives simple MBTI mappings from the shared
 * `src/lib/data/mbti.ts` palettes. This module provides lightweight
 * color/name/phrase maps suitable for server responses and socket payloads.
 *
 * Rationale:
 * Keep `MBTI_PALETTES` as the single authoritative source; derive smaller
 * maps here so server code can import concise values without duplicating
 * palette definitions.
 */
import { MBTI_PALETTES } from '../constants/mbti';

/**
 * Mapping of MBTI -> hex color string (preferred mid/core color).
 * Populated on module initialization by `deriveMappings()`.
 */
export const MBTI_COLORS: Record<string, string> = {};

/**
 * Mapping of MBTI -> display name (server-side placeholder values).
 * Client UI may provide richer localized names; server keeps lightweight
 * names for logs and simple payloads.
 */
export const MBTI_NAMES: Record<string, string> = {};

/**
 * Mapping of MBTI -> lucky phrase (empty by default, reserved for later use).
 */
export const MBTI_LUCKY_PHRASES: Record<string, string> = {};

/**
 * deriveMappings()
 * Populate `MBTI_COLORS`, `MBTI_NAMES`, and `MBTI_LUCKY_PHRASES` from the
 * canonical `MBTI_PALETTES` object. This runs at module initialization so
 * consumers can rely on the exported constants immediately after import.
 */
function deriveMappings(): void {
  Object.keys(MBTI_PALETTES).forEach((k) => {
    const key = k as keyof typeof MBTI_PALETTES;
    const p = MBTI_PALETTES[key];
    MBTI_COLORS[key as string] = p.mid || p.core;
    MBTI_NAMES[key as string] = String(key);
    MBTI_LUCKY_PHRASES[key as string] = '';
  });
}

deriveMappings();

/**
 * getColors()
 * Return a shallow copy of the MBTI -> color map.
 */
export function getColors(): Record<string, string> {
  return { ...MBTI_COLORS };
}

/**
 * getNames()
 * Return a shallow copy of the MBTI -> name map.
 */
export function getNames(): Record<string, string> {
  return { ...MBTI_NAMES };
}

/**
 * getPhrases()
 * Return a shallow copy of the MBTI -> lucky phrase map.
 */
export function getPhrases(): Record<string, string> {
  return { ...MBTI_LUCKY_PHRASES };
}

export default { MBTI_COLORS, MBTI_NAMES, MBTI_LUCKY_PHRASES, getColors, getNames, getPhrases };
