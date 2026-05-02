/*
  spriteCache.ts
  說明：提供舊版 `$lib/core/spriteCache` 相容 API，將 palette/order 與 sprite
  快取入口轉接到目前的 `config/mbti` 與 `function/sprites` 實作。
*/

import { MBTI_ORDER, MBTI_PALETTES } from '$lib/shared/constants/mbti';
import { getDotSprite, getSpriteSet } from '$lib/utils/sprites';

export { MBTI_ORDER, MBTI_PALETTES };

export function getSpriteSetEntries(mbti: string) {
	/*
	  取得指定 MBTI 的 sprite 集。
	  @param mbti - MBTI key。
	  @returns dot/blob/field 三種 sprite entry。
	*/
	return getSpriteSet(mbti);
}

export function getDotEntry(color: string) {
	/*
	  取得單色 ambient dot sprite。
	  @param color - 顏色字串。
	  @returns 與 legacy runtime 相容的 dot entry。
	*/
	return getDotSprite(color).dot;
}

export default { MBTI_ORDER, MBTI_PALETTES, getSpriteSetEntries, getDotEntry };