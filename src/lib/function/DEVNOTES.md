<!--
  devnote.md
  說明：針對 當前 core/function 模組遷移的即時開發筆記與下一步項目。
  舊有內容不可修改！此文件為開發筆記，請勿刪除或修改現有內容；所有更新應在下方新增紀錄。
-->

# Dev note — core migration (snapshot)

## 舊有內容不可修改！此文件為開發筆記，請勿刪除或修改現有內容；所有更新應在下方新增紀錄。

## Metadata

- author: automated-migration-assistant
- action: created coordinator.ts wiring socket/UI glue into TS modules
- migration_stage: in-progress

**更新指南**

- 每次更新不可以刪除現有內容，應在原有內容下方新增更新紀錄。

## 更新紀錄

- 日期：2026-04-24 05:30 UTC

已完成項目：

- 將 `ml-camera` 轉為 SSR-safe（`setVideo` / `getVideo` / `setupCamera`）。
- 將部分 legacy `.js`（例如舊版 ml-camera 等）移除，並以 TypeScript 版本取代。
- 建立 `particleFull/` 骨架模組：`spriteCache.ts`、`particle.ts`、`index.ts`（目前為 skeleton）。
- 檢視並整理 core 中的主要檔案，發現 `particleFull.js` 為 monolithic runtime，且部分功能已在 TS 檔分拆完成。

當前狀態（問題/注意事項）：

- `particleFull.js` 尚未移除，包含 DOM 與即時 rAF loop；需先將 UI glue 與 socket 事件拆成 client-only bridge，才能安全移除。
- `pool.ts` 檔案內有重複代碼段（存在兩組相似實作），建議清理並驗證匯出一致性。
- 新增的 `particleFull/spriteCache.ts` 目前為骨架，`sprites.ts` 已有完整實作；需決定哪個為最終 source-of-truth。

下一步建議（優先順序）：

1. 決定 source-of-truth：採 `sprites.ts`/`particle.ts`/`pool.ts`（現有完整 TS）或合併到 `particleFull/`。
2. 清理 `pool.ts` 重複段落，修正匯出衝突。
3. 已開始：將 `particleFull.js` 的 UI glue（Socket.IO、DOM badge、legend、toast、loop 啟動）拆成 `coordinator.ts`（位於 `src/lib/function/coordinator.ts`），bridge 提供 `initcoordinator()` / `startBridge()` / `stopBridge()`。
4. 把 sprite prewarm (`prewarmAll`) 由 Canvas client-side 呼叫，避免在模組載入時建立 Canvas。
5. 逐檢查並在每一步後執行 `npm run check`，並在本地啟動 `npm run dev` 做視覺驗證。


---

## 更新紀錄 

- 日期：2026-04-24 10:29 UTC

## 更新紀錄

- 日期：2026-04-24 11:00 UTC
- 更新內容：掃描並核對 `src/lib/function` 內所有 TypeScript 檔案，確認 `particleFull` 的功能已拆分到以下模組：
  - `sprites.ts`：sprite 建立與 `prewarmAll()`（sprite builders、dot/blob/field）。
  - `particle.ts`：`Particle` 類、`pickSizeClass()`、`drawDiamondSparkle()`、`nearestFace()`、`dist2sq()`。
  - `pool.ts`：粒子池管理（`particles`, `mbtiParticles`, `spawnMBTI`, `seedAmbient`, quota/prune）。
  - `drawmode.ts`：手勢繪製 state machine 與 overlay (`_tickDrawMode`, `_drawStrokeOverlay`)。
  - `ml-camera.ts`：MediaPipe / camera 初始化、`setVideo`/`getVideo`/`setupCamera`、`mapToCanvas()`。
  - `ui-network.ts`：legend、toast、socket handler helper (`initSocketHandlers`)。
  - `emotion.ts`：emoji / emotion badge helpers。
  - `coordinator.ts`（新增）：client-only bridge，將 socket/UI glue 與 TS 模組整合（`initcoordinator` / `startBridge` / `stopBridge`）。

- 觀察到的剩餘事項（待處理）：
  - `particleFull.js` 仍存在於 `src/lib/function`，該檔含有 top-level DOM、rAF loop、socket 直接綁定等 legacy 行為。建議在確認 bridge 行為等效後刪除該檔。
  - `pool.ts` 目前包含兩組重複實作段落（檔內重複 copy），需清理以免匯出衝突或意外覆寫。
  - `spriteCache.ts` 為骨架實作，尚未被採用；目前 `sprites.ts` 為實際運行的 sprite 實作，請決定哪個為最終 source-of-truth，或合併骨架至 `sprites.ts`。

- 建議下一步（優先）：
  1. 清理 `pool.ts` 的重複段落並執行 `npm run check`。
  2. 在 `Canvas.svelte` 的 client-only `onMount` 呼叫 `prewarmAll()` 並啟動 `coordinator.startBridge()`。
  3. 在確認功能無誤後，移除 `particleFull.js`（保留備份分支或標記 commit）。

---

## 更新紀錄


- 日期：2026-04-24 12:05 UTC
- 更新內容：將 `particleBridge.ts` 正式改名為 `coordinator.ts`（保留短期相容 stub 已移除），並新增 `mountCoordinator(videoEl?)` 便利函式，方便在 `Canvas.svelte` 的 `onMount` 一行完成初始化與啟動，回傳 cleanup 函式供 `onDestroy` 使用。
- 注意：此為 append-only 記錄，未更動任何既有條目。

- 日期：2026-04-25  
  更新內容：清理已完成的冗餘內容，移除未被引用且已由 `sprites.ts` 完整取代的 `spriteCache.ts` 骨架檔，並同步更新 `CORE_FILES.md` 以標示 sprite 實作的單一來源。
