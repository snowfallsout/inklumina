<!--
  CORE_FILES.md
  說明：列出 `src/lib/core` 底下主要檔案與其職責摘要，方便遷移與審核。
  注意：此文件為開發說明，不會被程式引用。
-->

# Core modules overview

下列均位於 `src/lib/function`（或其子資料夾），按檔名簡述其主要責任：

- `particleFull.js` — Legacy 單檔實作（不 SSR-safe）
  - 完整 runtime：sprite builders、`Particle` 類、render loop、MediaPipe 相機處理、Socket.IO glue、DOM 操作（badge、legend、toast）
  - 狀態：待拆解與逐步棄用；現存為行為參考。

- `sprites.ts` — Sprite (dot/blob/field) 建立與快取
  - 提供 `_makeDot/_makeBlob/_makeField`、`getSpriteSet(mbti)`、`getDotSprite(color)`、`prewarmAll()`
  - 特性：以 Canvas 建立 sprite，故呼叫應在 client (onMount) 進行。

- `particle.ts` — TypeScript 版本的 `Particle` 類與輔助函式
  - 包含物理參數、`update()`、`draw()`、`pickSizeClass()`、`drawDiamondSparkle()`、`dist2sq()`、`nearestFace()`。

- `pool.ts` — 粒子池管理（spawn、seedAmbient、quota 與 prune）
  - 匯出 `particles`, `mbtiParticles`, `spawnMBTI`, `seedAmbient`, `pruneAllTypes` 等。
  - 注意：檔案中曾出現重複段落，需清理以避免多重匯出/覆寫。

- `ml-camera.ts` — 攝影機 / MediaPipe 桥接（已加 SSR guard）
  - 提供 `setVideo()/getVideo()/setupCamera()`、`mapToCanvas()`、frame 處理節流。
  - 設計：避免 top-level DOM，需在 client 元件中注入 `video` element。

- `drawmode.ts` — 手勢繪製模式（state machine + overlay 繪製）
  - 將 Draw Mode 邏輯從 monolith 分離，提供 `_tickDrawMode()`、`_drawStrokeOverlay()`。

- `emotion.ts` — Emoji 與情緒徽章輔助
  - 管理 smile emoji element、`_tickSmileEmoji()`、`updateEmotionBadge()`。

- `ui-network.ts` — Socket / 網路互動（事件處理、state 更新）
  - 負責接收 `spawn_particles`、`session_reset`、`state` 等事件並觸發 pool/legend/toast。

- `particleFull/` 目錄（規劃中）
  - `particle.ts` — 新增骨架：Particle 類骨架（已建立基本型）
  - `index.ts` — 組合匯出與建議初始化順序說明

- 其他備註檔與子模組
  - `display/`：包含 `runtime/` 與 session 顯示相關的子模組（camera.ts, draw.ts, sprite.ts 等），部分 UI 負責與 particle 系統互動。
  - `session/`：session client 與面板相關模組（client.ts, panel.ts, qr.ts 等）。
  - `DEVNOTES.md`：開發紀錄（已存在於同目錄）。

---

短評與決策補充

- 注意：`sprites.ts` 為 sprite 生產的 single source-of-truth；先前的 `spriteCache.ts` 骨架已移除，避免雙軌維護。
- 注意：`pool.ts` 檔案內以前有重複段落，請在下一步清理重複並確認匯出一致性（`particles`, `mbtiParticles`, `spawnMBTI`, `seedAmbient`）。
- 建議把所有直接操作 DOM 或建立 canvas 的程式碼限定在 client-only 初始化（例如由 `Canvas.svelte` 在 `onMount` 呼叫 `prewarmAll()` / `setup`）。

---

短評與決策建議

- 優先使用已存在的 TypeScript 實作（`sprites.ts`、`particle.ts`、`pool.ts`）作為 source-of-truth；把 `particleFull.js` 視為行為參考逐步拆解。
- 所有 canvas / document 建立必須放在 client-only 初始化路徑（例如 `Canvas.svelte` 的 `onMount`），或在呼叫 `prewarmAll()` 等明確 function 時建立。
- 清理 `pool.ts` 中重複內容，並確保匯出不重複。

如果需，我可以把此文件轉成 repository README 的一部分或新增 TODO PR 模板。
