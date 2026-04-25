# Gemini-Map-Tree-v2

檔案建立日期：2026-04-19

目的：將使用者提供之 canonical map 與本專案實際檔案樹做交叉比對並記錄差異、建議與下一步。

---

## 1) 高階結論

- 本專案為 SvelteKit + TypeScript + Vite，主要程式碼位於 `src/`，與 canonical map 高度相符。
- core、services、stores、routes 四大層級在 repo 中皆可對應，唯有少數命名與檔案分布上的差異。

## 2) 逐項對照（canonical ↔ repo）

- core（計算層）
  - canonical: `interactionGrid.ts`, `particleEngine.ts`, `spriteCache.ts`
  - repo: `src/lib/core/` 含 `interactionGrid.ts`, `particleEngine.ts`, `spriteCache.ts`
  - 結論：完全匹配

- services（通訊層）
  - canonical: `mediapipe.ts`, `socket.ts`
  - repo: `src/lib/services/` 含 `mediapipe.ts`, `socket.ts`
  - 結論：完全匹配（符合單例/封裝意圖）

- stores（狀態層）
  - canonical: `media.ts`, `mbti.ts`, `particles.ts`
  - repo: `src/lib/stores/` 含 `media.ts`, `mbti.ts`, `particles.ts`, 並額外有 `session.ts`, `ui.ts`
  - 結論：基本匹配；repo 管理更多狀態

- components（視圖層）
  - canonical: `components/engine/Stage.svelte`（Canvas/RAF）、`components/ui/Legend.svelte`
  - repo: `src/lib/components/display/Canvas.svelte`, `Legend.svelte`，另有多個 UI widgets（`Header.svelte`, `HandBadge.svelte`, `Toast.svelte`）及 `mobile/`
  - 差異：功能對應（Canvas ↔ Stage），但路徑/命名不同；repo 元件更豐富

- config（參數層）
  - canonical: `config/settings.ts`
  - repo: 無專門 `config/` 目錄或 `settings.ts`（設定可能分散在 `core/` 或 `stores/`）
  - 建議：若希望集中管理參數，可新增 `src/lib/config/settings.ts`

- routes（路由）
  - canonical: `routes/+page.svelte`
  - repo: `src/routes/` 含 `+layout.svelte`, `+page.svelte`, `+page.ts`，與子路由 `routes/display/`（含 `+server.ts`）
  - 結論：匹配且更完整（有 server 端處理）

- static / assets
  - canonical: `static/assets/`（MediaPipe 權重）
  - repo: `static/` 有多個 HTML 入口（`display.html`, `entryMotion.html`, `mobile.html`），且 `src/lib/assets/` 目錄存在（具體內容需檢查）
  - 建議：確認 MediaPipe 模型/權重放置位置或下載流程

## 3) 差異摘要與建議

- 無 `config/settings.ts`：若專案需要集中調參，建議新增 `src/lib/config/settings.ts` 作為單一來源。
- components 路徑命名差異：canonical 使用 `engine/Stage.svelte`，repo 使用 `display/Canvas.svelte`。功能對應但命名需注意以便團隊同步。
- stores 額外存在 `session.ts` 與 `ui.ts`：代表 repo 管理更多 UI/session 狀態，檢查是否有重複或可精簡的狀態邏輯。

## 4) 可選下一步（我可以代勞）

1. 新增 `src/lib/config/settings.ts` 範本（非破壞性新增）。
2. 產生一份對照表（CSV / Markdown）列出 canonical 路徑 ↔ repo 路徑（便於自動化同步）。
3. 搜尋 repository 中所有可能的設定常數（`const` / `export const`），協助定位分散設定。

---

檔案已由代理自動建立。若要我執行上述任一下一步，請告訴我想做哪一項（例如：`新增 settings.ts 範本` 或 `產生對照表`）。
