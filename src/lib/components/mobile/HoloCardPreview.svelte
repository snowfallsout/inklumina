<script lang="ts">
/**
 * HoloCardPreview.svelte — Preview and generate holo share image
 *
 * File-level:
 * Lightweight wrapper that calls into `generateHoloCardImage` to
 * produce a shareable image. Exposes a `generate(opts)` method and
 * optionally calls `ongenerated` with the resulting data URL.
 */
import { generateHoloCardImage } from '$lib/utils/holoCanvas';
interface Props {
  mbti?: string;
  color?: string;
  nickname?: string | undefined;
  phrase?: string | undefined;
  ongenerated?: (payload: { url: string | null }) => void;
}

const {
  mbti = '' as string,
  color = '#888888' as string,
  nickname = undefined as string | undefined,
  phrase = undefined as string | undefined,
  ongenerated
}: Props = $props();
let imageUrl = $state<string | null>(null);

/**
 * generate(opts)
 * Generate a holo card image using the provided options or the
 * component's default props. Returns a JPEG data URL or `null`.
 *
 * @param opts - Optional overrides for mbti/color/nickname/phrase
 * @returns Promise resolving to the generated data URL or null
 */
export async function generate(opts?: { mbti?: string; color?: string; nickname?: string; phrase?: string }): Promise<string | null> {
  const useMbti = opts?.mbti ?? mbti ?? '';
  const useColor = opts?.color ?? color ?? '#888888';
  const useNickname = opts?.nickname ?? nickname;
  const usePhrase = opts?.phrase ?? phrase;
  const url = generateHoloCardImage({ mbti: useMbti, color: useColor, nickname: useNickname, phrase: usePhrase });
  imageUrl = url;
  ongenerated?.({ url: imageUrl });
  return imageUrl;
}
</script>

<div class="holo-preview">
  {#if imageUrl}
    <img src={imageUrl} alt="holo card" style="max-width:100%;border-radius:12px;box-shadow:0 8px 32px rgba(40,50,80,.2)" />
  {:else}
    <div class="holo-preview-placeholder">生成中或尚未生成</div>
  {/if}
</div>

<style>
.holo-preview{width:100%;display:flex;align-items:center;justify-content:center}
.holo-preview-placeholder{width:100%;height:200px;border-radius:12px;background:linear-gradient(180deg,#fff,#f4f5f8);display:flex;align-items:center;justify-content:center;color:rgba(26,26,34,.6)}
</style>
